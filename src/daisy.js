const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const readline = require("readline");
const { init } = require("./inititalize");
const {
  fileProcessor,
  batchCompletionProcessor,
  batchEmbeddingsProcessor,
  splitFiles,
  writeResponsesToFile,
  writePreviewMarkdownToFile,
  getChangedFilesWithStatus,
} = require("./fileProcessor");
const { generateCostSummary } = require("./utils");

async function readInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main({
  skipCompletion,
  update,
  filePath,
  fullProcess,
  dirPath,
}) {
  const codeBasePath = process.env.CODE_BASE_PATH || process.cwd();
  const folderPath = filePath
    ? path.dirname(filePath)
    : dirPath || codeBasePath;

  const finalConfig = await init(codeBasePath);

  let allFilesToProcess;
  if (filePath) {
    allFilesToProcess = await fileProcessor(
      path.resolve(filePath),
      finalConfig
    );
  } else if (fullProcess || skipCompletion) {
    allFilesToProcess = await fileProcessor(folderPath, finalConfig);
  } else if (dirPath) {
    allFilesToProcess = await fileProcessor(dirPath, finalConfig);
  } else {
    console.error(
      "Error: You must specify exactly one of --file, --full, or --dir."
    );
    process.exit(1);
  }

  if (update) {
    console.log(`Documenting Changed Files...`);
    const { addedFiles, modifiedFiles, deletedFiles } =
      await getChangedFilesWithStatus(folderPath, finalConfig);
    // const changeLogSummary = await createChangeLog({ addedFiles, modifiedFiles, deletedFiles, config });

    // Combine addedFiles and modifiedFiles into a single array
    const updatedFiles = [...addedFiles, ...modifiedFiles];

    // Filter allFilesToProcess to only include items with a filePath value that matches the objects in the updatedFiles array
    allFilesToProcess = allFilesToProcess.filter((file) =>
      updatedFiles.some((updatedFile) => updatedFile.filePath === file.filePath)
    );

    console.log("Done finding changed files.");

    console.log("allFilesToProcess:", allFilesToProcess);
  }

  let answer = "y";

  if (!skipCompletion) {
    const previewAnswer = await readInput(
      "Do you want to preview the the prompts before proceeding? (y/n): "
    );

    if (previewAnswer.toLowerCase() === "y") {
      await writePreviewMarkdownToFile(allFilesToProcess, finalConfig);
      console.log(
        "Preview markdown files written to your daisy folder. Please review them and make any changes you want in the prompts/templates folders. When you are ready, run this script again to proceed with the magic ..."
      );
    }

    const summary = generateCostSummary(allFilesToProcess);

    console.log("\nSummary:");
    console.log(summary);

    answer = await readInput("Do you want to proceed? (y/n): ");
  }

  if (answer.toLowerCase() === "y") {
    console.log("Proceeding with magic...");
    const [skipCompletionFiles, filesForDocumentation] =
      splitFiles(allFilesToProcess);

    console.log("Writing markdown files directly...");
    await writeResponsesToFile(skipCompletionFiles, [], finalConfig);

    if (!skipCompletion) {
      console.log(
        `Sending ${filesForDocumentation.length} files for documentation...`
      );
      await batchCompletionProcessor({
        files: filesForDocumentation,
        config: finalConfig,
      });
    }

    console.log(
      `Memorizing ${allFilesToProcess.length} new documentation files... that was easy!`
    );
    const embeddings = await batchEmbeddingsProcessor({
      files: allFilesToProcess,
      config: finalConfig,
    });

    console.log(`All files memorized!`);
  } else {
    console.log("Documenation canceled.");
  }
  await new Promise((resolve) => process.stdin.once("end", resolve));
}

module.exports = {
  main,
};

if (require.main === module) {
  main({
    skipCompletion: true, // Default if ran from command line
  });
}
