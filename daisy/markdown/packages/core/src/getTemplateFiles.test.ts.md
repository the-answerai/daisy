Template:

Summary:
This code is a script that contains two utility functions: `getTemplateFiles` and `readTemplateFile`. These functions are used to retrieve the content of template files. The script is part of a larger software application and is responsible for handling file operations related to templates.

Import statements:
- `getTemplateFiles` and `readTemplateFile` are imported from the `getTemplateFiles` module, which is a local file in the same directory as this script.
- `readdir` and `readFile` are imported from the built-in `fs/promises` module, which provides asynchronous file system operations.
- `parse` and `join` are imported from the built-in `path` module, which provides utilities for working with file paths.

Script Summary:
The script is a test file that contains unit tests for the `getTemplateFiles` and `readTemplateFile` functions. It uses Jest, a JavaScript testing framework, to mock certain functions and test the behavior of the utility functions.

Internal Functions:
- `getTemplateFiles`: This function takes a `templateFilePath` parameter and returns a promise that resolves to an object containing the content of template files. It uses the `readdir` function to get a list of template files in the specified directory, and then uses the `join` and `parse` functions to manipulate file paths. Finally, it uses the `readFile` function to read the content of each template file and returns an object with the file names as keys and the file content as values.

- `readTemplateFile`: This function takes a `filePath` parameter and returns a promise that resolves to the content of the file at the specified path. It uses the `readFile` function to read the file content and returns it.

External Functions:
None

Interaction Summary:
The `getTemplateFiles` function can be used to retrieve the content of template files in a specified directory. The `readTemplateFile` function can be used to read the content of a single file. These functions can be used by other parts of the application that need to work with template files.

Developer Questions:
- How do I use the `getTemplateFiles` function to retrieve template files?
- How do I use the `readTemplateFile` function to read the content of a file?
- How do I handle errors when using these functions?
- How do I write unit tests for these functions?