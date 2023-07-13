import daisy, {
  DaisyConfig,
  FileData,
  generateCostSummary,
  init,
  writePreviewMarkdownToFile,
} from "@answerai/daisy-core";
import readline from "readline/promises";
import { Command } from "commander";
import { resolve } from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const codeBasePath = process.env.CODE_BASE_PATH || process.cwd();

const confirmCompletionsFunction = async (
  files: FileData[],
  config: DaisyConfig
) => {
  const previewAnswer = await rl.question(
    "Do you want to preview the the prompts before proceeding? (y/n): "
  );

  if (previewAnswer.toLowerCase() === "y") {
    await writePreviewMarkdownToFile(files, config);
    console.log(
      "Preview markdown files written to your daisy folder. Please review them and make any changes you want in the prompts/templates folders. When you are ready, run this script again to proceed with the magic ..."
    );
  }

  const summary = generateCostSummary(files);

  console.log("\nSummary:");
  console.log(summary);

  const answer = await rl.question("Do you want to proceed? (y/n): ");
  return answer.toLowerCase() === "y";
};

const proceedWithoutAsking = async (files: FileData[], config: DaisyConfig) => {
  const summary = generateCostSummary(files);

  console.log("\nSummary:");
  console.log(summary);

  return true;
};

// Create a new instance of the commander Command
const program = new Command();

// Define the "start" command
program
  .command("start")
  .description("Start D.A.I.S.Y.")
  .option(
    "-i, --input <path>",
    "Path to the file or directory to be documented. leave blank to run against the entire code base"
  )
  .option(
    "-y, --yes",
    "Skip the confirmation prompts and proceed with the magic"
  )
  .action(async (options) => {
    options.input;

    // Start D.A.I.S.Y.
    console.log("Starting D.A.I.S.Y...");
    console.log(
      `Finding what code to document based on the .daisyrc file... update the .daisyrc file to change it to work best for your repo`
    );

    const codeBasePath = process.env.CODE_BASE_PATH
      ? resolve(process.cwd(), process.env.CODE_BASE_PATH)
      : process.cwd();

    const config = await init(codeBasePath);

    await daisy({
      skipCompletion: false,
      inputPath: options.input
        ? resolve(codeBasePath, options.input)
        : undefined,
      update: false,
      codeBasePath,
      config,
      confirmCompletionsFunction: options.yes
        ? proceedWithoutAsking
        : confirmCompletionsFunction,
    });
  });

// Define the "mem" command
program
  .command("mem")
  .description("Memorize to Pinecone")
  .action(async () => {
    console.log("Starting D.A.I.S.Y. with 'mem' command...");

    const config = await init(codeBasePath);
    await daisy({
      skipCompletion: true,
      codeBasePath,
      config,
      update: false,
      confirmCompletionsFunction,
    }); // Pass true to skip the batchCompletionProcessor
  });

// Define the "update" command
program
  .command("update")
  .description("Update changed files")
  .action(async () => {
    const config = await init(codeBasePath);
    console.log("Starting D.A.I.S.Y. with 'update' command...");
    await daisy({
      skipCompletion: false,
      update: true,
      config,
      codeBasePath,
      confirmCompletionsFunction,
    });
    // Call the updateChangedFiles function
  });

// Define the "list" command
program
  .command("list")
  .description("List all saved files")
  .action(() => {
    // List all saved files
    console.log("Listing all saved files...");
    // TODO: Implement the list functionality
  });

// Set the required number of commands to 1
program.allowUnknownOption(false).parse(process.argv);

// Show help if no command is specified
if (!program.args.length) {
  program.help();
}
