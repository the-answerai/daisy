Summary:
This code file contains a collection of functions related to Git operations. It provides functions for setting up the user, pulling a branch, pushing changes, switching to an existing branch, resetting changes, committing changes, checking if the repository is clean, checking if a file is ignored, checking if markdown files have changed, checking if the current head is a merge commit, finding a commit with a specific prefix, and getting the latest Daisy commit.

Import statements:
- `exec` and `getExecOutput` are imported from the `@actions/exec` module. These functions are used to execute shell commands.
- `DAISY_COMMIT_PREFIX` and `getDaisyCommitPrefixWithBranch` are imported from the `@answerai/daisy-core` module. These constants and functions are used to generate commit prefixes.

Script Summary:
This script provides a set of functions for performing various Git operations, such as setting up the user, pulling and pushing branches, committing changes, checking repository status, and finding specific commits.

Internal Functions:
- `setupUser`: This function sets up the Git user by configuring the user name and email.
- `pullBranch`: This function pulls the latest changes from a specified branch.
- `push`: This function pushes the local changes to a specified branch. It accepts an optional `force` parameter to force push.
- `pushTags`: This function pushes all tags to the remote repository.
- `switchToMaybeExistingBranch`: This function switches to a specified branch if it already exists. If the branch does not exist, it creates a new branch with the specified name.
- `reset`: This function resets the changes in a specified path. It accepts an optional `mode` parameter to specify the reset mode (hard, soft, or mixed).
- `commitAll`: This function commits all changes with a specified commit message.
- `checkIfClean`: This function checks if the repository is clean (no uncommitted changes).
- `isIgnored`: This function checks if a specified path is ignored by Git.
- `hasChangedMarkdownFiles`: This function checks if any markdown files in a specified directory have changed.
- `isCurrentHeadAMergeCommit`: This function checks if the current head is a merge commit.
- `findCommitWithPrefix`: This function finds a commit with a specified prefix in the commit message.
- `getLatestDaisyCommit`: This function gets the latest Daisy commit for a specified branch.

External Functions:
None

Interaction Summary:
This script can be used as a module in a larger software application that requires Git operations. It provides a set of functions that can be called to perform various Git tasks, such as pulling and pushing changes, committing changes, and checking repository status. These functions can be used in conjunction with other application logic to automate Git operations.

Developer Questions:
- How do I set up the Git user using the `setupUser` function?
- How do I pull the latest changes from a branch using the `pullBranch` function?
- How do I push changes to a branch using the `push` function?
- How do I switch to an existing branch or create a new branch using the `switchToMaybeExistingBranch` function?
- How do I reset changes in a specific path using the `reset` function?
- How do I commit changes with a specific message using the `commitAll` function?
- How do I check if the repository is clean using the `checkIfClean` function?
- How do I check if a file is ignored by Git using the `isIgnored` function?
- How do I check if markdown files have changed in a specific directory using the `hasChangedMarkdownFiles` function?
- How do I check if the current head is a merge commit using the `isCurrentHeadAMergeCommit` function?
- How do I find a commit with a specific prefix in the commit message using the `findCommitWithPrefix` function?
- How do I get the latest Daisy commit for a specific branch using the `getLatestDaisyCommit` function?

Known Issues/Bugs:
None

Todo:
None