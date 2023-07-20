import { GitHub, getOctokitOptions } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import * as core from "@actions/core";
import * as gitUtils from "./gitUtils";
import { throttling } from "@octokit/plugin-throttling";
import { type Octokit } from "@octokit/core";
import {
  DaisyConfig,
  FileData,
  getDaisyCommitPrefixWithBranch,
  runCompletions,
  runMemorization,
} from "@answerai/daisy-core";

// GitHub Issues/PRs messages have a max size limit on the
// message body payload.
// `body is too long (maximum is 65536 characters)`.
// To avoid that, we ensure to cap the message to 60k chars.
const MAX_CHARACTERS_PER_MESSAGE = 60000;

export const setupOctokit = (githubToken: string) => {
  return new (GitHub.plugin(throttling as any))(
    getOctokitOptions(githubToken, {
      throttle: {
        onRateLimit: (
          retryAfter: number,
          options: any,
          octokit: Octokit,
          retryCount: number
        ) => {
          core.warning(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );

          if (retryCount <= 2) {
            core.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (
          retryAfter: number,
          options: any,
          octokit: Octokit,
          retryCount: number
        ) => {
          core.warning(
            `SecondaryRateLimit detected for request ${options.method} ${options.url}`
          );

          if (retryCount <= 2) {
            core.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
      },
    })
  );
};

type MemorizeProps = {
  files: FileData[];
  config: DaisyConfig;
};

export const memorize = async ({ files, config }: MemorizeProps) => {
  if (!files.length) {
    core.info("No files to memorize");
    return;
  }
  await runMemorization({
    files,
    config,
  });
};

type GetMessageOptions = {
  files: FileData[];
  prBodyMaxCharacters: number;
  branch: string;
};

export async function getPrMessage({
  files,
  prBodyMaxCharacters,
  branch,
}: GetMessageOptions) {
  // TODO: needs to be published to github marketplace
  let messageHeader = `This PR was opened by the [D.A.I.S.Y action](https://github.com/daisy/action) GitHub action. When you're ready to do a release, you can merge this and the memorization will run automatically. If you're not ready to do memorize yet, that's fine, whenever you add more changesets to ${branch}, this PR will be updated.
`;
  let messageFilesHeading = `# Files`;

  let fullMessage = [
    messageHeader,
    messageFilesHeading,
    ...files.map((file) => file.filePath),
  ].join("\n");

  // Check that the message does not exceed the size limit.
  // If not, omit the changelog entries of each package.
  if (fullMessage.length > prBodyMaxCharacters) {
    fullMessage = [
      messageHeader,
      messageFilesHeading,
      `\n> The list of updated files has been omitted from this message, as the content exceeds the size limit.\n`,
    ].join("\n");
  }

  return fullMessage;
}

type RunCompletionsProps = {
  config: DaisyConfig;
  files: FileData[];
  githubToken: string;
  prTitle?: string;
  commitMessage?: string;
  prBodyMaxCharacters?: number;
};

type RunCompletionResult = {
  pullRequestNumber: number;
};

export async function runCompletionsAndCreatePr({
  config,
  files,
  githubToken,
  prTitle = "D.A.I.S.Y updates",
  prBodyMaxCharacters = MAX_CHARACTERS_PER_MESSAGE,
}: RunCompletionsProps): Promise<RunCompletionResult> {
  const octokit = setupOctokit(githubToken);

  let repo = `${github.context.repo.owner}/${github.context.repo.repo}`;
  let branch = github.context.ref.replace("refs/heads/", "");
  let completionsBranch = `daisy-completions/${branch}`;

  // if there had already been completions run and this PR is still open,
  // we should update the existing PR rather than creating a new one
  await gitUtils.switchToMaybeExistingBranch(completionsBranch);
  await gitUtils.reset(github.context.sha);

  core.info(JSON.stringify(files, null, 2));

  await runCompletions({
    files,
    config,
    branch,
    skipGit: true,
    cwd: config.codeBasePath,
    confirmCompletionsFunction: async () => true,
  });

  let searchQuery = `repo:${repo}+state:open+head:${completionsBranch}+base:${branch}+is:pull-request`;
  let searchResultPromise = octokit.rest.search.issuesAndPullRequests({
    q: searchQuery,
  });

  // project with `commit: true` setting could have already committed files
  if (!(await gitUtils.checkIfClean())) {
    await gitUtils.commitAll(getDaisyCommitPrefixWithBranch(branch));
  }

  await gitUtils.push(completionsBranch, { force: true });

  let searchResult = await searchResultPromise;
  core.info(JSON.stringify(searchResult.data, null, 2));

  let prBody = await getPrMessage({
    files,
    branch,
    prBodyMaxCharacters,
  });

  if (searchResult.data.items.length === 0) {
    core.info("creating pull request");
    const { data: newPullRequest } = await octokit.rest.pulls.create({
      base: branch,
      head: completionsBranch,
      title: prTitle,
      body: prBody,
      ...github.context.repo,
    });

    return {
      pullRequestNumber: newPullRequest.number,
    };
  } else {
    const [pullRequest] = searchResult.data.items;

    core.info(`updating found pull request #${pullRequest.number}`);
    await octokit.rest.pulls.update({
      pull_number: pullRequest.number,
      title: prTitle,
      body: prBody,
      ...github.context.repo,
    });

    return {
      pullRequestNumber: pullRequest.number,
    };
  }
}
