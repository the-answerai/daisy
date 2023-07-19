Summary:
This code file contains a collection of functions related to Git operations. It provides functions for setting up the user, pulling a branch, pushing changes, switching to a branch, resetting changes, committing changes, checking if the repository is clean, checking if a file is ignored, checking if markdown files have changed, checking if the current head is a merge commit, finding a commit with a specific prefix, and getting the latest Daisy commit.

Import statements:
- `exec` and `getExecOutput` are imported from the `@actions/exec` package. These functions are used to execute shell commands.
- `DAISY_COMMIT_PREFIX` and `getDaisyCommitPrefixWithBranch` are imported from the `@answerai/daisy-core` package. These constants and functions are used to work with Daisy commits.

Script Summary:
This script provides a set of functions for performing various Git operations, such as pushing changes, committing changes, checking the status of the repository, and finding specific commits. These functions can be used to automate Git operations in a software application.

Internal Functions:
- `setupUser`: This function sets up the Git user by configuring the user name and email.
- `pullBranch`: This function pulls the latest changes from a specified branch.
- `push`: This function pushes the changes to a specified branch. It accepts an optional `force` parameter to force push the changes.
- `pushTags`: This function pushes the tags to the remote repository.
- `switchToMaybeExistingBranch`: This function switches to a specified branch. If the branch does not exist, it creates a new branch with the specified name.
- `reset`: This function resets the changes in the repository. It accepts a `pathSpec` parameter to specify the files or directories to reset and a `mode` parameter to specify the reset mode (hard, soft, or mixed).
- `commitAll`: This function commits all the changes in the repository with a specified commit message.
- `checkIfClean`: This function checks if the repository is clean, i.e., there are no uncommitted changes.
- `isIgnored`: This function checks if a specified file or directory is ignored by Git.
- `hasChangedMarkdownFiles`: This function checks if any markdown files in a specified directory have changed.
- `isCurrentHeadAMergeCommit`: This function checks if the current head is a merge commit.
- `findCommitWithPrefix`: This function finds a commit with a specified prefix in the commit message.
- `getLatestDaisyCommit`: This function gets the latest Daisy commit for a specified branch.

External Functions:
None

Interaction Summary:
This script can be used to automate Git operations in a software application. It provides functions for setting up the user, pulling changes, pushing changes, switching branches, resetting changes, committing changes, checking the repository status, checking if a file is ignored, checking if markdown files have changed, checking if the current head is a merge commit, finding commits with specific prefixes, and getting the latest Daisy commit. These functions can be called from other parts of the application to perform Git operations.

Developer Questions:
- How do I set up the Git user for automated operations?
- How do I pull the latest changes from a branch?
- How do I push changes to a branch?
- How do I switch to a branch, creating it if it doesn't exist?
- How do I reset changes in the repository?
- How do I commit changes with a specific message?
- How do I check if the repository is clean?
- How do I check if a file or directory is ignored by Git?
- How do I check if markdown files have changed?
- How do I check if the current head is a merge commit?
- How do I find a commit with a specific prefix in the commit message?
- How do I get the latest Daisy commit for a branch?