import { exec, getExecOutput } from "@actions/exec";
import {
  DAISY_COMMIT_PREFIX,
  getDaisyCommitPrefixWithBranch,
} from "@answerai/daisy-core";

export const setupUser = async () => {
  await exec("git", ["config", "user.name", `"daisy[bot]"`]);
  await exec("git", ["config", "user.email", `"daisy@theanswer.ai"`]);
};

export const pullBranch = async (branch: string) => {
  await exec("git", ["pull", "origin", branch]);
};

export const push = async (
  branch: string,
  { force }: { force?: boolean } = {}
) => {
  await exec(
    "git",
    ["push", "origin", `HEAD:${branch}`, force && "--force"].filter<string>(
      Boolean as any
    )
  );
};

export const pushTags = async () => {
  await exec("git", ["push", "origin", "--tags"]);
};

export const switchToMaybeExistingBranch = async (branch: string) => {
  let { stderr } = await getExecOutput("git", ["checkout", branch], {
    ignoreReturnCode: true,
  });
  let isCreatingBranch = !stderr
    .toString()
    .includes(`Switched to a new branch '${branch}'`);
  if (isCreatingBranch) {
    await exec("git", ["checkout", "-b", branch]);
  }
};

export const reset = async (
  pathSpec: string,
  mode: "hard" | "soft" | "mixed" = "hard"
) => {
  await exec("git", ["reset", `--${mode}`, pathSpec]);
};

export const commitAll = async (message: string) => {
  await exec("git", ["add", "."]);
  await exec("git", ["commit", "-m", message]);
};

export const checkIfClean = async (): Promise<boolean> => {
  const { stdout } = await getExecOutput("git", ["status", "--porcelain"]);
  return !stdout.length;
};

export const isIgnored = async (path: string): Promise<boolean> => {
  const { stdout } = await getExecOutput("git", ["check-ignore", path], {
    ignoreReturnCode: true,
  });
  return !!stdout;
};

export const hasChangedMarkdownFiles = async (markdownDir: string) => {
  const { stdout } = await getExecOutput("git", [
    "diff",
    "HEAD",
    "HEAD~1",
    "--name-only",
    "--",
    markdownDir,
  ]);
  return stdout.split("\n").filter(Boolean).length > 0;
};

export const isCurrentHeadAMergeCommit = async () => {
  const { stdout, stderr } = await getExecOutput(
    "git",
    ["rev-parse", "--verify", "--quiet", "HEAD^2"],
    { ignoreReturnCode: true }
  );
  return !stderr && !!stdout;
};

export const findCommitWithPrefix = async (prefix: string) => {
  const { stdout } = await getExecOutput("git", ["log", `--format=%H %s`]);
  if (!stdout.trim()) return;
  return stdout
    .split("\n")
    .map((l) => {
      const firstSpaceIndex = l.indexOf(" ");
      const hash = l.slice(0, firstSpaceIndex);
      const message = l.slice(firstSpaceIndex + 1);
      return { hash, message };
    })
    .filter(({ message }) => message.startsWith(prefix))
    .map(({ hash }) => hash)[0];
};

export const getLatestDaisyCommit = async (branch: string) => {
  const branchCommit = await findCommitWithPrefix(
    getDaisyCommitPrefixWithBranch(branch)
  );
  return branchCommit || (await findCommitWithPrefix(DAISY_COMMIT_PREFIX));
};
