Summary:
This code is a module that provides various functions for interacting with Git within a software application. It includes functions for setting up the user's Git configuration, pulling a branch, pushing changes, switching to an existing branch, resetting changes, committing changes, checking if the repository is clean, checking if a file is ignored, and getting a list of changed Markdown files.

Import statements:
- `exec` and `getExecOutput` are imported from the `@actions/exec` module. These functions are used to execute shell commands and retrieve their output.

Script Summary:
This script exports several functions that can be used to perform Git operations. These functions are all asynchronous and use the `exec` and `getExecOutput` functions to execute Git commands.

Internal Functions:
- `setupUser`: This function sets up the user's Git configuration by setting the user name and email.
- `pullBranch`: This function pulls the latest changes from a specified branch.
- `push`: This function pushes changes to a specified branch. It accepts an optional `force` parameter to force the push.
- `pushTags`: This function pushes tags to the remote repository.
- `switchToMaybeExistingBranch`: This function switches to a specified branch if it already exists. If the branch does not exist, it creates a new branch with the specified name.
- `reset`: This function resets changes in the repository. It accepts a `pathSpec` parameter to specify the files or directories to reset and a `mode` parameter to specify the reset mode (hard, soft, or mixed).
- `commitAll`: This function commits all changes in the repository with a specified commit message.
- `checkIfClean`: This function checks if the repository is clean, i.e., if there are no uncommitted changes.
- `isIgnored`: This function checks if a specified file or directory is ignored by Git.
- `getChangedMarkdownFiles`: This function retrieves a list of changed Markdown files in a specified directory.

External Functions:
- None

Interaction Summary:
This script can be used by other parts of the software application to perform Git operations. For example, it can be used to set up the user's Git configuration before performing any Git-related tasks, pull the latest changes from a branch, push changes to a branch, switch to an existing branch or create a new branch, reset changes, commit changes, check if the repository is clean, check if a file is ignored, and get a list of changed Markdown files.

Developer Questions:
- How do I set up the user's Git configuration?
- How do I pull the latest changes from a branch?
- How do I push changes to a branch?
- How do I switch to an existing branch or create a new branch?
- How do I reset changes in the repository?
- How do I commit changes?
- How do I check if the repository is clean?
- How do I check if a file is ignored by Git?
- How do I get a list of changed Markdown files?