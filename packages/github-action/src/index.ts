import * as core from "@actions/core";
import { writeFile } from "fs/promises";
import * as gitUtils from "./gitUtils";
import { memorize, runCompletionsAndCreatePr } from "./run";
import {
  getCurrentBranch,
  getFilesToProcess,
  init,
} from "@answerai/daisy-core";
import { resolve } from "path";

(async () => {
  let githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    core.setFailed("Please add the GITHUB_TOKEN to the daisy action");
    return;
  }

  if (!process.env.ANSWERAI_API_KEY) {
    core.setFailed(
      "Please add the ANSWERAI_API_KEY to the daisy action environment variables"
    );
    return;
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
  const markdownDirectory = resolve(process.cwd(), config.markdownDirectory);
  const isDaisyIgnored = await gitUtils.isIgnored(markdownDirectory);

  if (isDaisyIgnored) {
    core.setFailed(
      "Daisy output directory is git-ignored. You must have the daisy directory in source control to use the daisy github action."
    );
    return;
  }

  const cwd = config.codeBasePath;
  const branch = await getCurrentBranch(config.codeBasePath);
  const lastCommit = await gitUtils.getLatestDaisyCommit(branch);
  core.info(`Last Daisy commit: ${lastCommit})`);
  const update = !!lastCommit;

  let filesToUpdate = await getFilesToProcess({
    inputPath: config.codeBasePath,
    update,
    config,
    cwd,
    branch,
  });

  let needsMemorization = false;
  const needsCompletions = filesToUpdate.length > 0;
  if (!needsCompletions) {
    needsMemorization = await gitUtils.hasChangedMarkdownFiles(
      markdownDirectory
    );
  }

  switch (true) {
    case !filesToUpdate.length && !needsMemorization:
      core.info("Nothing of value has changed. exiting.");
      return;
    case needsMemorization: {
      core.info("Memorizing to Pinecone...");

      filesToUpdate = await getFilesToProcess({
        inputPath: config.codeBasePath,
        update: false,
        config,
        cwd,
        branch,
      });

      await memorize({
        config,
        files: filesToUpdate,
      });

      core.setOutput("memorized", "true");
      return;
    }
    case filesToUpdate.length > 0:
      core.info("Documenting changed files...");
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
