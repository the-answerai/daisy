#!/usr/bin/env node
const daisy = require("./src/daisy.js");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Define the CLI using yargs
const argv = yargs(hideBin(process.argv))
  .command(
    "start",
    "Start D.A.I.S.Y.",
    (yargs) => {
      yargs.option("file", {
        describe: "Path to the file to be documented",
        type: "string",
      });
      yargs.option("full", {
        alias: "f",
        describe: "Run the full process on all files",
        type: "boolean",
        default: false,
      });
      yargs.option("dir", {
        describe: "Path to the directory containing files to be documented",
        type: "string",
      });
    },
    async (argv) => {
      const filePath = argv.file;
      let fullProcess = argv.full;
      const dirPath = argv.dir;

      // Check that only one of file, full, or dir is passed
      const count = ["file", "full", "dir"].filter((opt) => argv[opt]).length;
      if (count !== 1) {
        fullProcess = true;
      }

      // Start D.A.I.S.Y.
      console.log("Starting D.A.I.S.Y...");
      // console.log("file:", argv.file);
      // console.log("full:", argv.full);
      // console.log("dir:", argv.dir);

      console.log(
        `Finding what code to document based on the .daisyrc file... update the .daisyrc file to change it to work best for your repo`
      );

      await daisy.main({
        skipCompletion: false,
        filePath,
        fullProcess,
        dirPath,
      }); // Pass the file path, fullProcess flag, and dirPath to the main function
    }
  )
  .command("mem", "Memorize to Pinecone", {}, async () => {
    console.log("Starting D.A.I.S.Y. with 'mem' command...");
    await daisy.main({
      skipCompletion: true,
    }); // Pass true to skip the batchCompletionProcessor
  })
  .command("update", "Update changed files", {}, async () => {
    console.log("Starting D.A.I.S.Y. with 'update' command...");
    await daisy.main({
      skipCompletion: false,
      update: true,
    }); // Call the updateChangedFiles function
  })
  .command("list", "List all saved files", {}, () => {
    // List all saved files
    console.log("Listing all saved files...");
    // TODO: Implement the list functionality
  })
  .demandCommand(1, "You need to specify a command to run.")
  .help()
  .alias("h", "help")
  .parse();

// Export the parsed CLI arguments
module.exports = {
  argv,
};
