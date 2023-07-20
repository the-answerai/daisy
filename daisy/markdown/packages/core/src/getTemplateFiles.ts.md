Template:
Summary:
This code is a module that provides functions for reading template files and retrieving their contents. It uses the fs/promises module to read files from the file system and the path module to manipulate file paths.

Import statements:
- `readdir` and `readFile` are imported from the `fs/promises` module. These functions are used to read the contents of a directory and a file, respectively.
- `parse` and `join` are imported from the `path` module. `parse` is used to parse a file path and extract its components, while `join` is used to join multiple path segments into a single path.

Script Summary:
This script exports two functions: `readTemplateFile` and `getTemplateFiles`. `readTemplateFile` reads the contents of a template file given its file path, while `getTemplateFiles` reads the contents of all template files in a directory and returns them as an object.

Internal Functions:
- `readTemplateFile(filePath: string) => Promise<string>`: This function takes a file path as a parameter and returns a promise that resolves to the contents of the file. It uses the `readFile` function from the `fs/promises` module to read the file.
- `getTemplateFiles(templateFilePath: string) => Promise<Record<string, string>>`: This function takes a directory path as a parameter and returns a promise that resolves to an object containing the contents of all template files in the directory. It uses the `readdir` function from the `fs/promises` module to get the list of files in the directory, and then iterates over each file to read its contents using the `readTemplateFile` function. The contents are stored in the `templates` object, where the keys are the file names without extensions and the values are the file contents.

External Functions:
- `readTemplateFile(filePath: string) => Promise<string>`: This function takes a file path as a parameter and returns a promise that resolves to the contents of the file.
- `getTemplateFiles(templateFilePath: string) => Promise<Record<string, string>>`: This function takes a directory path as a parameter and returns a promise that resolves to an object containing the contents of all template files in the directory.

Interaction Summary:
This script can be used by other parts of the application that need to read template files. The `readTemplateFile` function can be used to read the contents of a single template file, while the `getTemplateFiles` function can be used to read the contents of all template files in a directory.

Developer Questions:
- How do I use the `readTemplateFile` function to read a template file?
- How do I use the `getTemplateFiles` function to read all template files in a directory?
- What format are the template files returned in by the `getTemplateFiles` function?
- What happens if the file or directory paths provided to the functions are invalid?
- Are there any performance considerations when using these functions to read large template files or directories with a large number of files?