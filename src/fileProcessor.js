const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { PineconeClient } = require("@pinecone-database/pinecone");
const client = new PineconeClient();
const axios = require("axios");

const {
  countTokens,
  compileCompletionPrompts,
  getCompletionModelBasedOnTokenSize,
  getEstimatedPricing,
} = require("./utils");
const { createChatCompletion, createEmbedding } = require("./openai");

const getGitCommit = async () => {
  const gitCommit = await new Promise((resolve, reject) => {
    exec("git rev-parse --short HEAD", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      resolve(stdout.trim());
    });
  });

  return gitCommit;
};

const getFileData = async (filePath, config) => {
  if (!isInvalidFile(filePath, config)) {
    const fileTypeObj = getFileType(filePath, config);
    let tokens = 0;
    let model = "";
    let cost = 0;
    const completionObj = await compileCompletionPrompts(
      filePath,
      fileTypeObj.prompt,
      fileTypeObj.skipCompletion,
      config
    );

    if (!fileTypeObj.skipCompletion) {
      tokens = await countTokens(completionObj.fullPrompt);
      model = getCompletionModelBasedOnTokenSize(tokens);
      cost = getEstimatedPricing(model, tokens);
    }

    // TODO: Send to the embedding api for classification
    return {
      filePath,
      type: fileTypeObj.type,
      prompt: fileTypeObj.prompt,
      template: fileTypeObj.template,
      skipCompletion: fileTypeObj.skipCompletion,
      fullPrompt: completionObj?.fullPrompt,
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

const fileProcessor = async (iPath, config) => {
  const filesData = [];
  const isDirectory = (await fs.stat(iPath)).isDirectory();
  const files = await (isDirectory ? fs.readdir(iPath) : [iPath]);
  // console.log({ iPath, isDirectory, files });

  for (const file of files) {
    const filePath = isDirectory ? path.join(iPath, file) : file;
    const fileStats = await fs.stat(filePath);

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

const isInvalidFile = (filePath, config) => {
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

const getFileContents = async (filePath) => {
  try {
    const contents = await fs.readFile(`${filePath}.md`, "utf-8");
    return {
      contents,
      filePath,
    };
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return null;
  }
};

const getFileType = (filePath, config) => {
  for (const [type, fileType] of Object.entries(config.fileTypes)) {
    const ext = path.extname(filePath);

    if (fileType.fileTypes && fileType.fileTypes.includes(ext)) {
      return {
        type,
        prompt: fileType.prompt,
        template: fileType.template,
        skipCompletion: fileType.skipCompletion || false,
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
        skipCompletion: fileType.skipCompletion || false,
      };
    }
  }

  return {
    type: "default",
    prompt: config.fileTypes.default.prompt,
    template: config.fileTypes.default.template,
    skipCompletion: config.fileTypes.default.skipCompletion || false,
  };
};

const batchCompletionProcessor = async ({ files, config }) => {
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const responses = await generateResponses(batch, config);
    await writeResponsesToFile(batch, responses, config);
  }
};

const getFilePathWithReplacedBase = (file, config) => {
  const relativePath = file?.filePath?.replace(config.codeBasePath, "");
  return path.join(config.markdownDirectory, relativePath);
};

const prepareData = async ({ file, packageJson, config, gitCommit }) => {
  const fileWithReplaceBase = getFilePathWithReplacedBase(file, config);
  const { contents: content, filePath } = await getFileContents(
    fileWithReplaceBase
  );
  const relativeFilePath = path
    .relative(config.markdownDirectory, filePath)
    .replace(".md.md", ".md");

  const fullCodePath = path.join(config.codeBasePath, relativeFilePath);

  const codeContent = await fs.readFile(fullCodePath, "utf-8");
  const repo = `${packageJson.name}-v${packageJson.version}-${gitCommit}`;

  return {
    repo,
    content,
    codeContent,
    filePath: relativeFilePath,
    fullCodePath,
    packageJson,
  };
};

const generateAndUpsertEmbedding = async ({
  config,
  repo,
  index,
  content,
  codeContent,
  filePath,
}) => {
  try {
    const response = await createEmbedding({
      model: "text-embedding-ada-002",
      input: content,
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

const batchPineconeEmbeddingsProcessor = async ({
  files,
  packageJson,
  config,
  gitCommit,
}) => {
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const index = client.Index(config.pineconeIndexName);
  const batchSize = 20;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file) => {
        const { repo, content, codeContent, filePath } = await prepareData({
          file,
          packageJson,
          config,
          gitCommit,
        });
        await generateAndUpsertEmbedding({
          repo,
          content,
          codeContent,
          filePath,
          config,
          index,
          packageJson,
        });
      })
    );
  }
};

// TODO: Add Docusauraus support
const writeResponsesToFile = async (files, responses, config) => {
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(
      config.markdownDirectory,
      files[i].filePath.replace(config.codeBasePath, "")
    );
    const fileDir = path.dirname(filePath);
    const fileContent =
      responses[i]?.data?.choices[0]?.message?.content ||
      files[i]?.fileContents;

    await fs.mkdir(fileDir, { recursive: true });
    await fs.writeFile(`${filePath}.md`, fileContent);
    console.log(`Documentation written to: ${filePath}`);
  }
};

const writePreviewMarkdownToFile = async (files, config) => {
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(
      config.daisyDirectory,
      "preview",
      files[i].filePath.replace(config.codeBasePath, "")
    );
    const fileDir = path.dirname(filePath);
    const fileContent = files[i]?.fullPrompt || files[i]?.fileContents;
    await fs.mkdir(fileDir, { recursive: true });
    await fs.writeFile(`${filePath}.md`, fileContent, "utf-8");
    console.log(`Preview Prompts written to: ${filePath}`);
  }
};

const generateResponses = async (files, config) => {
  return await Promise.all(
    files.map((file) =>
      createChatCompletion({
        gptModel: file.model,
        prompt: file.fullPrompt,
        config,
      })
    )
  );
};

const splitFiles = (files) => {
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

async function getChangedFilesWithStatus(codepath, config) {
  return new Promise((resolve, reject) => {
    exec(
      "git rev-parse --verify HEAD",
      { cwd: codepath },
      (error, stdout, stderr) => {
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
            new Error(`Error verifying HEAD: ${stderr || error.message}`)
          );
        }

        exec(
          `git diff --name-status HEAD ${codepath}`,
          { cwd: codepath },
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
              return { filePath, status };
            });

            const gitDiffPromises = changedFiles.map(async (file) => {
              return new Promise((resolve, reject) => {
                exec(
                  `git diff HEAD -- ${file.filePath}`,
                  { cwd: codepath },
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
            });

            Promise.all(gitDiffPromises)
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
      }
    );
  });
}

const callAnswerAiEmbeddingApi = async ({
  config,
  repo,
  content,
  codeContent,
  filePath,
}) => {
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

const batchAnswerAiEmbeddingsProcessor = async ({
  files,
  packageJson,
  config,
  gitCommit,
}) => {
  const batchSize = 20;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file) => {
        const { repo, content, codeContent, filePath } = await prepareData({
          file,
          packageJson,
          config,
          gitCommit,
        });
        await callAnswerAiEmbeddingApi({
          repo,
          content,
          codeContent,
          filePath,
          config,
          packageJson,
        });
      })
    );
  }
};

const batchEmbeddingsProcessor = async ({ files, config }) => {
  const packageJson = require(path.join(config.codeBasePath, "package.json"));
  const gitCommit = await getGitCommit();
  if (config.answerAI?.apiKey) {
    await batchAnswerAiEmbeddingsProcessor({
      files,
      packageJson,
      config,
      gitCommit,
    });
  } else {
    await batchPineconeEmbeddingsProcessor({
      files,
      packageJson,
      config,
      gitCommit,
    });
  }
};
module.exports = {
  fileProcessor,
  batchCompletionProcessor,
  batchEmbeddingsProcessor,
  getFileType,
  isInvalidFile,
  splitFiles,
  writeResponsesToFile,
  writePreviewMarkdownToFile,
  getChangedFilesWithStatus,
  getGitCommit,
};
