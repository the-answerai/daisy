import { stat, readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { PineconeClient } from "@pinecone-database/pinecone";
import axios from "axios";

import {
  countTokens,
  compileCompletionPrompts,
  getCompletionModelBasedOnTokenSize,
  getEstimatedPricing,
} from "./utils";

import { createChatCompletion, createOpenAiEmbedding } from "./ai";
import {
  ChangedFiles,
  DaisyConfig,
  FileContents,
  FileData,
  FileInfo,
  FileTypeObject,
  PackageJson,
} from "./types";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { Configuration, OpenAIApi } from "openai";

const client = new PineconeClient();

export const getGitBranch = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec("git branch --show-current", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      resolve(stdout.trim());
    });
  });
};

export const getFileData = async (
  filePath: string,
  config: DaisyConfig
): Promise<FileData | null> => {
  if (!isInvalidFile(filePath, config)) {
    const fileTypeObj = getFileType(filePath, config);
    let tokens = 0;
    let model = "";
    let cost = "0";
    const completionObj = await compileCompletionPrompts({
      filePath,
      prompt: fileTypeObj.prompt,
      skipCompletion: fileTypeObj.skipCompletion,
      config,
    });

    if (!fileTypeObj.skipCompletion) {
      tokens = countTokens(completionObj?.fullPrompt ?? "");
      model = getCompletionModelBasedOnTokenSize(tokens) ?? "";
      cost = getEstimatedPricing(model, tokens) ?? "0";
    }

    // TODO: Send to the embedding api for classification
    return {
      filePath,
      type: fileTypeObj.type,
      prompt: fileTypeObj.prompt,
      template: fileTypeObj.template,
      skipCompletion: fileTypeObj.skipCompletion,
      fullPrompt: completionObj?.fullPrompt || "",
      fileContents: completionObj?.fileContents,
      tokens,
      model,
      cost,
    };
  } else {
    console.log(`Skipping file: ${filePath}`);
    return null;
  }
};

export const fileProcessor = async (
  iPath: string,
  config: DaisyConfig
): Promise<FileData[]> => {
  const filesData: FileData[] = [];
  const isDirectory = (await stat(iPath)).isDirectory();
  const files = await (isDirectory ? readdir(iPath) : [iPath]);

  for (const file of files) {
    const filePath = isDirectory ? path.join(iPath, file) : file;
    const fileStats = await stat(filePath);

    if (fileStats.isDirectory()) {
      if (
        !config.invalidPaths.some((invalidPath) =>
          filePath.includes(invalidPath)
        )
      ) {
        filesData.push(...(await fileProcessor(filePath, config)));
      }
    } else {
      const fileData = await getFileData(filePath, config);
      if (fileData) {
        // TODO: Send to the embedding api for classification
        filesData.push(fileData);
      }
    }
  }

  return filesData;
};

export const isInvalidFile = (
  filePath: string,
  config: DaisyConfig
): boolean => {
  const ext = path.extname(filePath);
  const fileParentDir = path.dirname(filePath);
  const cond1 = config.invalidPaths.some((invalidPath) =>
    fileParentDir.includes(invalidPath)
  );

  const cond2 = config.invalidFileTypes.includes(ext);
  const cond3 = config.invalidFileNames.includes(path.basename(filePath));

  if (cond1 || cond2 || cond3) {
    console.log(`Skipping file: ${filePath}`, cond1, cond2, cond3);
    return true;
  }

  return false;
};

export const getFileContents = async (
  filePath: string
): Promise<FileContents | null> => {
  try {
    const contents = await readFile(`${filePath}.md`, "utf-8");
    return {
      contents,
      filePath,
    };
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return null;
  }
};

export const getFileType = (
  filePath: string,
  config: DaisyConfig
): FileTypeObject => {
  for (const [type, fileType] of Object.entries(config.fileTypes)) {
    const ext = path.extname(filePath);

    if (fileType.fileTypes && fileType.fileTypes.includes(ext)) {
      return {
        type,
        prompt: fileType.prompt,
        template: fileType.template,
        skipCompletion: !!fileType.skipCompletion,
      };
    }

    if (
      fileType.pathIncludes &&
      fileType.pathIncludes.some((pathPart) => filePath.includes(pathPart))
    ) {
      return {
        type,
        prompt: fileType.prompt,
        template: fileType.template,
        skipCompletion: !!fileType.skipCompletion,
      };
    }
  }

  return {
    type: "default",
    prompt: config.fileTypes.default.prompt,
    template: config.fileTypes.default.template,
    skipCompletion: !!config.fileTypes.default.skipCompletion,
  };
};

export type batchCompletionProcessorProps = {
  files: FileData[];
  config: DaisyConfig;
};

export const batchCompletionProcessor = async ({
  files,
  config,
}: batchCompletionProcessorProps) => {
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const responses = await generateResponses(batch, config);
    await writeResponsesToFile(batch, responses, config);
  }
};

export const getFilePathWithReplacedBase = (
  file: FileData,
  config: DaisyConfig
) => {
  const relativePath = file?.filePath?.replace(config.codeBasePath, "");
  return path.join(config.markdownDirectory, relativePath);
};

export type PrepareDataProps = {
  file: FileData;
  packageJson: PackageJson;
  config: DaisyConfig;
  branch: string;
};

export const prepareData = async ({
  file,
  packageJson,
  config,
  branch,
}: PrepareDataProps) => {
  const fileWithReplaceBase = getFilePathWithReplacedBase(file, config);
  const fileContents = await getFileContents(fileWithReplaceBase);
  if (!fileContents) {
    return null;
  }
  const filePath = fileContents.filePath;
  const content = fileContents.contents;
  const relativeFilePath = path
    .relative(config.markdownDirectory, filePath)
    .replace(".md.md", ".md");

  const fullCodePath = path.join(config.codeBasePath, relativeFilePath);

  const codeContent = await readFile(fullCodePath, "utf-8");
  const repo = `${packageJson.name}-v${packageJson.version}-${branch}`;

  return {
    repo,
    content,
    codeContent,
    filePath: relativeFilePath,
    fullCodePath,
    packageJson,
  };
};

export type GenerateAndUpsertEmbeddingsProps = {
  config: DaisyConfig;
  repo: string;
  index: VectorOperationsApi;
  content: string;
  codeContent: string;
  filePath: string;
};

export const generateAndUpsertEmbedding = async ({
  config,
  repo,
  index,
  content,
  codeContent,
  filePath,
}: GenerateAndUpsertEmbeddingsProps) => {
  try {
    if (!config.openAiApiKey) {
      console.error("No OpenAI API Key provided");
      return;
    }
    const configuration = new Configuration({
      apiKey: config.openAiApiKey,
    });

    const openAi = new OpenAIApi(configuration);

    const response = await createOpenAiEmbedding({
      model: "text-embedding-ada-002",
      input: content,
      openAi,
    });

    const vectorId = `daisy_${repo}_${filePath.replace(/\//g, "_")}`;

    await index
      .upsert({
        upsertRequest: {
          namespace: config.pineconeNamespace,
          vectors: [
            {
              id: vectorId,
              values: response.data.data[0].embedding,
              metadata: {
                text: content,
                tokens: response?.data?.usage?.total_tokens,
                filePath,
                source: `codebase`,
                repo,
                code: codeContent,
              },
            },
          ],
        },
      })
      .catch((error) => {
        console.error("Error upserting embeddings to Pinecone:", error);
        console.error("Error Response:", error?.response?.data);
      });

    console.log(
      `Upserted vector: ${vectorId} with source: 'daisy', repo: '${repo}'`
    );
  } catch (error) {
    console.error("Error calling openai.createEmbedding:", error);
  }
};

export type BatchPineconeEmbeddingsProcessorProps = {
  files: FileData[];
  packageJson: PackageJson;
  config: DaisyConfig;
  branch: string;
};

export const batchPineconeEmbeddingsProcessor = async ({
  files,
  packageJson,
  config,
  branch,
}: BatchPineconeEmbeddingsProcessorProps) => {
  if (!config.openAiApiKey) {
    console.error("No AnswerAI API key found in config");
    return;
  }
  if (!config.pineconeApiKey) {
    console.error("No Pinecone API key found in config");
    return;
  }
  if (!config.pineconeIndexName) {
    console.error("No Pinecone index name found in config");
    return;
  }
  if (!config.pineconeEnvironment) {
    console.error("No Pinecone namespace found in config");
    return;
  }
  const configuration = new Configuration({
    apiKey: config.openAiApiKey,
  });

  const openai = new OpenAIApi(configuration);
  await client.init({
    apiKey: config.pineconeApiKey,
    environment: config.pineconeEnvironment,
  });
  const index = client.Index(config.pineconeIndexName);
  const batchSize = 20;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file) => {
        const data = await prepareData({
          file,
          packageJson,
          config,
          branch,
        });
        if (!data) {
          return;
        }
        const { repo, content, codeContent, filePath } = data;
        await generateAndUpsertEmbedding({
          repo,
          content,
          codeContent,
          filePath,
          config,
          index,
        });
      })
    );
  }
};

// TODO: Add Docusauraus support
export const writeResponsesToFile = async (
  files: FileData[],
  responses: any[],
  config: DaisyConfig
) => {
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(
      config.markdownDirectory,
      files[i].filePath.replace(config.codeBasePath, "")
    );
    const fileDir = path.dirname(filePath);
    const fileContent =
      responses[i]?.data?.choices[0]?.message?.content ||
      files[i]?.fileContents;

    await mkdir(fileDir, { recursive: true });
    await writeFile(`${filePath}.md`, fileContent);
    console.log(`Documentation written to: ${filePath}`);
  }
};

export const writePreviewMarkdownToFile = async (
  files: FileData[],
  config: DaisyConfig
) => {
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(
      config.daisyDirectoryName,
      "preview",
      files[i].filePath.replace(config.codeBasePath, "")
    );
    const fileDir = path.dirname(filePath);
    const fileContent = files[i]?.fullPrompt || files[i]?.fileContents;
    await mkdir(fileDir, { recursive: true });
    fileContent && (await writeFile(`${filePath}.md`, fileContent, "utf-8"));
    console.log(`Preview Prompts written to: ${filePath}`);
  }
};

export const generateResponses = async (
  files: FileData[],
  config: DaisyConfig
) => {
  let openAi: OpenAIApi | undefined;
  if (config.openAiApiKey) {
    const configuration = new Configuration({
      apiKey: config.openAiApiKey,
    });
    openAi = new OpenAIApi(configuration);
  }
  return await Promise.all(
    files.map((file) =>
      createChatCompletion({
        model: file.model,
        prompt: file.fullPrompt,
        config,
        openAi,
      })
    )
  );
};

export const splitFiles = (files: FileData[]) => {
  const skipCompletionFiles = [];
  const otherFiles = [];

  for (const file of files) {
    if (file.skipCompletion) {
      skipCompletionFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  return [skipCompletionFiles, otherFiles];
};

export async function getChangedFilesWithStatus(
  codepath: string,
  config: DaisyConfig
): Promise<ChangedFiles> {
  const cwd = (await stat(codepath)).isDirectory()
    ? codepath
    : path.dirname(codepath);
  return new Promise((resolve, reject) => {
    exec("git rev-parse --verify HEAD", { cwd }, (error, stdout, stderr) => {
      if (error && stderr.includes("fatal: Needed a single revision")) {
        // No commit history found, returning empty result.
        return resolve({
          addedFiles: [],
          modifiedFiles: [],
          deletedFiles: [],
        });
      } else if (error || stderr) {
        // Some other error occurred, rejecting the promise.
        return reject(
          new Error(`Error verifying HEAD: ${stderr || error?.message}`)
        );
      }

      exec(
        `git diff --name-status HEAD ${codepath}`,
        { cwd },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          }
          if (stderr) {
            reject(stderr);
          }
          const fileStatusList = stdout.split("\n").filter(Boolean);
          const changedFiles = fileStatusList.map((fileStatus) => {
            const [status, filePath] = fileStatus.split("\t");
            return { filePath, status } as FileInfo;
          });

          Promise.all(
            changedFiles.map(async (file) => {
              return new Promise<FileInfo>((resolve, reject) => {
                exec(
                  `git diff HEAD -- ${file.filePath}`,
                  { cwd },
                  (error, stdout, stderr) => {
                    if (error) {
                      reject(error);
                    }
                    if (stderr) {
                      reject(stderr);
                    }
                    file.gitDiff = stdout;
                    resolve(file);
                  }
                );
              });
            })
          )
            .then((result) => {
              const addedFiles = [];
              const modifiedFiles = [];
              const deletedFiles = [];

              for (const file of result) {
                const fullFilePath = path.join(
                  config.codeBasePath,
                  file.filePath
                );
                if (!isInvalidFile(fullFilePath, config)) {
                  const { filePath, status, gitDiff } = file;

                  switch (status) {
                    case "A":
                      addedFiles.push({
                        filePath: path.join(config.codeBasePath, filePath),
                        gitDiff,
                        status,
                      });
                      break;
                    case "M":
                      modifiedFiles.push({
                        filePath: path.join(config.codeBasePath, filePath),
                        gitDiff,
                        status,
                      });
                      break;
                    case "D":
                      deletedFiles.push({
                        filePath: path.join(config.codeBasePath, filePath),
                        gitDiff,
                        status,
                      });
                      break;
                  }
                }
              }

              resolve({ addedFiles, modifiedFiles, deletedFiles });
            })
            .catch((error) => reject(error));
        }
      );
    });
  });
}

export type CallAnswerAiEmbeddingApiProps = {
  config: DaisyConfig;
  repo: string;
  content: string;
  codeContent: string;
  filePath: string;
};

export const callAnswerAiEmbeddingApi = async ({
  config,
  repo,
  content,
  codeContent,
  filePath,
}: CallAnswerAiEmbeddingApiProps) => {
  if (!config.answerAI) {
    console.error("AnswerAI config not found");
    return;
  }
  const resp = await axios
    .post(
      config.answerAI.embeddingsUrl,
      {
        repo,
        text: content,
        filePath: filePath,
        code: codeContent,
      },
      {
        method: "post",
        headers: {
          contentType: "application/json",
          authorization: `Bearer ${config.answerAI.apiKey}`,
        },
      }
    )
    .catch((err) => {
      console.log("error in callAnswerAiEmbeddingApi", err.response.data);
    });
};

export type BatchAnswerAiEmbeddingsProcessorProps = {
  files: FileData[];
  packageJson: any;
  config: DaisyConfig;
  branch: string;
};

export const batchAnswerAiEmbeddingsProcessor = async ({
  files,
  packageJson,
  config,
  branch,
}: BatchAnswerAiEmbeddingsProcessorProps) => {
  const batchSize = 20;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file) => {
        const data = await prepareData({
          file,
          packageJson,
          config,
          branch,
        });
        if (!data) {
          return;
        }
        const { repo, content, codeContent, filePath } = data;
        await callAnswerAiEmbeddingApi({
          repo,
          content,
          codeContent,
          filePath,
          config,
        });
      })
    );
  }
};

export type BatchEmbeddingsProcessorProps = {
  files: FileData[];
  config: DaisyConfig;
};

export const batchEmbeddingsProcessor = async ({
  files,
  config,
}: BatchEmbeddingsProcessorProps) => {
  const packageJson = require(path.join(config.codeBasePath, "package.json"));
  const branch = await getGitBranch();
  if (config.answerAI?.apiKey) {
    await batchAnswerAiEmbeddingsProcessor({
      files,
      packageJson,
      config,
      branch,
    });
  } else {
    await batchPineconeEmbeddingsProcessor({
      files,
      packageJson,
      config,
      branch,
    });
  }
};
