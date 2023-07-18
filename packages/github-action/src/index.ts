import * as core from "@actions/core";
import { writeFile, readFile } from "fs/promises";
import * as gitUtils from "./gitUtils";
import { memorize, runCompletionsAndCreatePr } from "./run";
import {
  getCurrentBranch,
  getFilesToProcess,
  init,
} from "@answerai/daisy-core";
import { existsSync } from "fs";
import { resolve } from "path";

const getOptionalInput = (name: string) => core.getInput(name) || undefined;

(async () => {
  let githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    core.setFailed("Please add the GITHUB_TOKEN to the changesets action");
    return;
  }

  const inputCwd = core.getInput("cwd");
  if (inputCwd) {
    core.info("changing directory to the one given as the input");
    process.chdir(inputCwd);
  }

  let setupGitUser = core.getBooleanInput("setupGitUser");

  if (setupGitUser) {
    core.info("setting git user");
    await gitUtils.setupUser();
  }

  core.info("setting GitHub credentials");
  await writeFile(
    `${process.env.HOME}/.netrc`,
    `machine github.com\nlogin github-actions[bot]\npassword ${githubToken}`
  );

  core.setOutput("memorized", "false");
  core.setOutput("documented", "false");

  const config = await init(process.cwd());
  const daisyDirectory = resolve(process.cwd(), config.daisyDirectoryName);
  const completionHistoryFile = resolve(
    process.cwd(),
    config.completionHistoryConfigFile
  );
  const isDaisyIgnored = await gitUtils.isIgnored(daisyDirectory);

  if (isDaisyIgnored) {
    core.setFailed(
      "Daisy directory is git-ignored. You must have the daisy directory in source control to use the daisy github action."
    );
    return;
  }

  let update = true;

  if (
    !existsSync(completionHistoryFile) ||
    !JSON.parse(await readFile(completionHistoryFile, "utf-8"))[
      await getCurrentBranch()
    ]
  ) {
    // either the history file does not exist, or it does not contain history for the current branch.
    // in either case, we should not update.
    update = false;
  }

  const filesToUpdate = await getFilesToProcess({
    update,
    config,
  });

  // TODO: determine if it needs memorization
  const needsMemorization = `${1}` != "1";

  switch (true) {
    case !filesToUpdate.length && !needsMemorization:
      core.info("Nothing of value has changed. exiting.");
      return;
    case needsMemorization: {
      core.info("Memorizing to Pinecone...");

      // TODO: memorize
      await memorize({
        config,
        files: filesToUpdate,
      });

      core.setOutput("memorized", "true");
      return;
    }
    case filesToUpdate.length > 0:
      const pullRequestNumber = await runCompletionsAndCreatePr({
        config,
        files: filesToUpdate,
        githubToken,
      });

      core.setOutput("pullRequestNumber", String(pullRequestNumber));

      return;
  }
})().catch((err) => {
  core.error(err);
  core.setFailed(err.message);
});
