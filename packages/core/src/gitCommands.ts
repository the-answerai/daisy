import { DaisyConfig, FileGitInfo } from "./types";
import { exec } from "child_process";
import { execAsync } from "./utils";

export const DAISY_COMMIT_PREFIX = "Daisy Completions for branch: ";
export const getDaisyCommitPrefixWithBranch = (branch: string) =>
  `${DAISY_COMMIT_PREFIX}${branch}`;

export const verifyValidRepo = async (
  cwd: string
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    exec(`git rev-parse --verify HEAD`, { cwd }, (error, stdout, stderr) => {
      if (error && stderr.includes("fatal: Needed a single revision")) {
        // No commit history found, returning empty result.
        resolve(`No commit history found in ${cwd}`);
      } else if (error || stderr) {
        // Some other error occurred, rejecting the promise.
        return resolve(`Error verifying HEAD: ${stderr || error?.message}`);
      }
      resolve(undefined);
    });
  });
};

export const getCurrentBranch = async (cwd: string): Promise<string> => {
  return execAsync("git branch --show-current", cwd);
};

export const getChangedFiles = async ({
  cwd,
  lastCommit,
  codepath,
}: {
  cwd: string;
  lastCommit: string;
  codepath: string;
}): Promise<FileGitInfo[]> => {
  const stdout = await execAsync(
    `git diff --name-status ${lastCommit} ${codepath}`,
    cwd
  );
  const fileStatusList = stdout.split("\n").filter(Boolean);
  const changedFiles = fileStatusList.map((fileStatus) => {
    const [status, filePath] = fileStatus.split("\t");
    return { filePath, status } as FileGitInfo;
  });
  return changedFiles;
};

export const getFileDiff = async ({
  file,
  lastCommit,
  cwd,
}: {
  file: FileGitInfo;
  lastCommit: string;
  cwd: string;
}): Promise<FileGitInfo> => {
  const gitDiff = await execAsync(
    `git diff ${lastCommit} -- ${file.filePath}`,
    cwd
  );
  return {
    ...file,
    gitDiff: gitDiff,
  };
};

export const findCommitWithPrefix = async ({
  cwd,
  prefix,
}: {
  cwd: string;
  prefix: string;
}) => {
  return execAsync(`git log --grep="^${prefix}" -1 --format="%H"`, cwd);
};

export const getLatestDaisyCommit = async ({
  branch,
  cwd,
}: {
  branch: string;
  cwd: string;
}) => {
  const branchCommit = await findCommitWithPrefix({
    cwd,
    prefix: getDaisyCommitPrefixWithBranch(branch),
  });
  return (
    branchCommit ||
    (await findCommitWithPrefix({ cwd, prefix: DAISY_COMMIT_PREFIX }))
  );
};

export const addMarkdownFiles = async ({
  config,
  cwd,
}: {
  config: DaisyConfig;
  cwd: string;
}) => {
  return execAsync(`git add ${config.markdownDirectory}`, cwd);
};

export const createNewCommit = async ({
  cwd,
  branch,
}: {
  cwd: string;
  branch: string;
}) => {
  return execAsync(
    `git commit --allow-empty -m "${getDaisyCommitPrefixWithBranch(branch)}"`,
    cwd
  );
};

export const createNewDaisyCommit = async ({
  config,
  branch,
  cwd,
}: {
  config: DaisyConfig;
  branch: string;
  cwd: string;
}) => {
  await addMarkdownFiles({ config, cwd });
  await createNewCommit({ cwd, branch });
};
