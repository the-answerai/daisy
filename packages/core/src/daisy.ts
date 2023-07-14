import {
  fileProcessor,
  batchCompletionProcessor,
  batchEmbeddingsProcessor,
  splitFiles,
  writeResponsesToFile,
  getChangedFilesWithStatus,
} from "./fileProcessor";
import { DaisyConfig, FileData } from "./types";

export type DaisyMainProps = {
  inputPath?: string;
  skipCompletion: boolean;
  update: boolean;
  codeBasePath: string;
  config: DaisyConfig;
  confirmCompletionsFunction: (
    files: FileData[],
    config: DaisyConfig
  ) => Promise<boolean>;
};

async function main({
  skipCompletion,
  update,
  codeBasePath,
  inputPath,
  config,
  confirmCompletionsFunction,
}: DaisyMainProps) {
  const iPath = inputPath ?? codeBasePath;

  let allFilesToProcess: FileData[] = await fileProcessor(iPath, config);

  if (update) {
    console.log(`Documenting Changed Files...`);
    const { addedFiles, modifiedFiles, deletedFiles } =
      await getChangedFilesWithStatus(iPath, config);
    // const changeLogSummary = await createChangeLog({ addedFiles, modifiedFiles, deletedFiles, config });

    // TODO: handle deleted files?

    // Combine addedFiles and modifiedFiles into a single array
    const updatedFiles = [...addedFiles, ...modifiedFiles];

    // Filter allFilesToProcess to only include items with a filePath value that matches the objects in the updatedFiles array
    allFilesToProcess = allFilesToProcess.filter((file) =>
      updatedFiles.some((updatedFile) => updatedFile.filePath === file.filePath)
    );

    console.log("Done finding changed files.");

    console.log(
      "allFilesToProcess:",
      allFilesToProcess.map((f) => f.filePath)
    );
  }

  const shouldContinue =
    skipCompletion ||
    (await confirmCompletionsFunction(allFilesToProcess, config));

  if (shouldContinue) {
    console.log("Proceeding with magic...");
    const [skipCompletionFiles, filesForDocumentation] =
      splitFiles(allFilesToProcess);

    console.log("Writing markdown files directly...");
    await writeResponsesToFile(skipCompletionFiles, [], config);

    if (!skipCompletion) {
      console.log(
        `Sending ${filesForDocumentation.length} files for documentation...`
      );
      await batchCompletionProcessor({
        files: filesForDocumentation,
        config: config,
      });
    }

    console.log(
      `Memorizing ${allFilesToProcess.length} new documentation files... that was easy!`
    );
    const embeddings = await batchEmbeddingsProcessor({
      files: allFilesToProcess,
      config: config,
    });

    console.log(`All files memorized!`);
  } else {
    console.log("Documentation canceled.");
  }
}

export default main;
