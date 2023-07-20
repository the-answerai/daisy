Summary:
This code file contains a set of functions related to Git operations. It provides functions for setting up the user, pulling a branch, pushing changes, switching branches, resetting changes, committing changes, checking if the repository is clean, checking if a file is ignored, checking if markdown files have changed, checking if the current head is a merge commit, finding a commit with a specific prefix, and getting the latest Daisy commit.

Import statements:
- `exec_1` from `@actions/exec`: This import is used to execute shell commands.
- `daisy_core_1` from `@answerai/daisy-core`: This import is used to get the Daisy commit prefix and branch.

Script Summary:
This script provides a set of functions for performing various Git operations. It sets up the user, pulls a branch, pushes changes, switches branches, resets changes, commits changes, checks if the repository is clean, checks if a file is ignored, checks if markdown files have changed, checks if the current head is a merge commit, finds a commit with a specific prefix, and gets the latest Daisy commit.

Internal Functions:
- `setupUser()`: This function sets up the Git user by configuring the user name and email.
- `pullBranch(branch)`: This function pulls the specified branch from the remote repository.
- `push(branch, { force })`: This function pushes the changes to the specified branch in the remote repository. The `force` parameter is optional and determines whether to force push the changes.
- `pushTags()`: This function pushes the tags to the remote repository.
- `switchToMaybeExistingBranch(branch)`: This function switches to the specified branch. If the branch does not exist, it creates a new branch with the specified name.
- `reset(pathSpec, mode)`: This function resets the changes in the specified path. The `pathSpec` parameter specifies the path to reset, and the `mode` parameter specifies the reset mode (default is "hard").
- `commitAll(message)`: This function commits all the changes with the specified commit message.
- `checkIfClean()`: This function checks if the repository is clean, i.e., there are no uncommitted changes.
- `isIgnored(path)`: This function checks if the specified path is ignored by Git.
- `hasChangedMarkdownFiles(markdownDir)`: This function checks if any markdown files in the specified directory have changed.
- `isCurrentHeadAMergeCommit()`: This function checks if the current head is a merge commit.
- `findCommitWithPrefix(prefix)`: This function finds a commit with the specified prefix in the commit message.
- `getLatestDaisyCommit(branch)`: This function gets the latest Daisy commit for the specified branch. If no branch is specified, it gets the latest Daisy commit for any branch.

External Functions:
- `exports.setupUser`: This function is exported and can be used to set up the Git user.
- `exports.pullBranch`: This function is exported and can be used to pull a branch from the remote repository.
- `exports.push`: This function is exported and can be used to push changes to a branch in the remote repository.
- `exports.pushTags`: This function is exported and can be used to push tags to the remote repository.
- `exports.switchToMaybeExistingBranch`: This function is exported and can be used to switch to a branch. If the branch does not exist, it creates a new branch.
- `exports.reset`: This function is exported and can be used to reset changes in a specified path.
- `exports.commitAll`: This function is exported and can be used to commit all changes with a specified message.
- `exports.checkIfClean`: This function is exported and can be used to check if the repository is clean.
- `exports.isIgnored`: This function is exported and can be used to check if a path is ignored by Git.
- `exports.hasChangedMarkdownFiles`: This function is exported and can be used to check if any markdown files in a directory have changed.
- `exports.isCurrentHeadAMergeCommit`: This function is exported and can be used to check if the current head is a merge commit.
- `exports.findCommitWithPrefix`: This function is exported and can be used to find a commit with a specified prefix in the commit message.
- `exports.getLatestDaisyCommit`: This function is exported and can be used to get the latest Daisy commit for a specified branch.

Interaction Summary:
This script provides a set of functions that can be used to perform various Git operations. It can be used in conjunction with other components of the software application to automate Git workflows, such as pulling changes, pushing changes, and checking the status of the repository. Developers can use these functions to integrate Git operations into their workflows and automate repetitive tasks.

Developer Questions:
- How do I set up the Git user using the `setupUser()` function?
- How do I pull a branch from the remote repository using the `pullBranch(branch)` function?
- How do I push changes to a branch in the remote repository using the `push(branch, { force })` function?
- How do I push tags to the remote repository using the `pushTags()` function?
- How do I switch to a branch using the `switchToMaybeExistingBranch(branch)` function?
- How do I reset changes in a specified path using the `reset(pathSpec, mode)` function?
- How do I commit all changes with a specified message using the `commitAll(message)` function?
- How do I check if the repository is clean using the `checkIfClean()` function?
- How do I check if a path is ignored by Git using the `isIgnored(path)` function?
- How do I check if any markdown files in a directory have changed using the `hasChangedMarkdownFiles(markdownDir)` function?
- How do I check if the current head is a merge commit using the `isCurrentHeadAMergeCommit()` function?
- How do I find a commit with a specified prefix in the commit message using the `findCommitWithPrefix(prefix)` function?
- How do I get the latest Daisy commit for a specified branch using the `getLatestDaisyCommit(branch)` function?

Known Issues or Bugs:
- No known issues or bugs.

Todo Items:
- No todo items.