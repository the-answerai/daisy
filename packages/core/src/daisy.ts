import { stat } from "fs/promises";
import {
  fileProcessor,
  batchCompletionProcessor,
  batchEmbeddingsProcessor,
  splitFiles,
  writeResponsesToFile,
  getChangedFilesWithStatus,
} from "./fileProcessor";
import {
  createNewDaisyCommit,
  getCurrentBranch,
  getLatestDaisyCommit,
} from "./gitCommands";
import { DaisyConfig, FileData } from "./types";
import { dirname } from "path";

export type GetFilesToProcessProps = {
  inputPath: string;
  update: boolean;
  config: DaisyConfig;
  cwd: string;
  branch: string;
};

export const getFilesToProcess = async ({
  inputPath,
  update,
  config,
  cwd,
  branch,
}: GetFilesToProcessProps) => {
  let allFilesToProcess: FileData[] = await fileProcessor(inputPath, config);

  if (update) {
    const lastCommit = await getLatestDaisyCommit({ branch, cwd });
    if (lastCommit) {
      console.log(`Documenting Changed Files since ${lastCommit}...`);
      const { addedFiles, modifiedFiles, deletedFiles } =
        await getChangedFilesWithStatus({
          codepath: inputPath,
          config,
          lastCommit,
          cwd,
        });
      // const changeLogSummary = await createChangeLog({ addedFiles, modifiedFiles, deletedFiles, config });

      // TODO: handle deleted files

      const updatedFiles = [...addedFiles, ...modifiedFiles];

      // Filter allFilesToProcess to only include items with a filePath value that matches the objects in the updatedFiles array
      allFilesToProcess = allFilesToProcess.filter((file) =>
        updatedFiles.some(
          (updatedFile) => updatedFile.filePath === file.filePath
        )
      );

      console.log("Done finding changed files.");
    } else {
      console.log(
        "No previous daisy commit found. Documenting all files in codebase."
      );
    }
  }

  return allFilesToProcess;
};

export type RunCompletionsProps = {
  files: FileData[];
  config: DaisyConfig;
  cwd: string;
  branch: string;
  skipGit?: boolean;
  confirmCompletionsFunction: (
    files: FileData[],
    config: DaisyConfig
  ) => Promise<boolean>;
};

export const runCompletions = async ({
  files,
  config,
  cwd,
  branch,
  skipGit,
  confirmCompletionsFunction,
}: RunCompletionsProps) => {
  const goAhead = await confirmCompletionsFunction(files, config);
  if (goAhead) {
    console.log("Proceeding with magic...");
    const [skipCompletionFiles, filesForDocumentation] = splitFiles(files);

    console.log("Writing markdown files directly...");
    await writeResponsesToFile(skipCompletionFiles, [], config);

    console.log(
      `Sending ${filesForDocumentation.length} files for documentation...`
    );
    await batchCompletionProcessor({
      files: filesForDocumentation,
      config: config,
    });
    console.log(`Documentation completed!`);
    if (!skipGit) {
      console.log("Creating new commit and tag...");
      await createNewDaisyCommit({
        branch,
        cwd,
        config,
      });
      console.log(
        `Created a new daisy commit. Remember to push the commit to the remote branch with git push origin ${branch}`
      );
    }
  } else {
    console.log("Documentation canceled.");
  }
  return goAhead;
};

export type RunMemorizationProps = {
  files: FileData[];
  config: DaisyConfig;
};

export const runMemorization = async ({
  files,
  config,
}: RunMemorizationProps) => {
  console.log(
    `Memorizing ${files.length} new documentation files... that was easy!`
  );
  const embeddings = await batchEmbeddingsProcessor({
    files: files,
    config: config,
    cwd: config.codeBasePath,
  });

  console.log(`All files memorized!`);
};

export type DaisyMainProps = {
  inputPath?: string;
  skipCompletion: boolean;
  update: boolean;
  config: DaisyConfig;
  memorize: boolean;
  confirmCompletionsFunction: (
    files: FileData[],
    config: DaisyConfig
  ) => Promise<boolean>;
};

async function main({
  skipCompletion,
  update,
  inputPath,
  config,
  memorize,
  confirmCompletionsFunction,
}: DaisyMainProps) {
  const iPath = inputPath ?? config.codeBasePath;
  const cwd = (await stat(iPath)).isDirectory() ? iPath : dirname(iPath);
  const branch = await getCurrentBranch(cwd);

  const files = await getFilesToProcess({
    inputPath: iPath,
    update,
    config,
    cwd,
    branch,
  });

  if (!skipCompletion) {
    memorize =
      memorize &&
      (await runCompletions({
        files,
        config,
        branch,
        cwd,
        confirmCompletionsFunction,
      }));
  }

  if (memorize) {
    await runMemorization({
      files,
      config,
    });
  }
}

export default main;
