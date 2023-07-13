# D.A.I.S.Y.

D.A.I.S.Y. - Document Automation and Intelligent System. A helpful bot that documents your code for you. It allows you to save it into memory and chat with it using AnswerAI or your own OpenAI or Pinecone API Keys.

## Usage

To use D.A.I.S.Y., you need to install it globally and then run it. Once it's running, you can chat with it using AnswerAI.

### First time

- Add the following environment variables to your .env file
  - PINECONE_API_KEY (required)
  - PINECONE_ENVIRONMENT (required)
  - OPENAI_API_KEY (required)
  - DAISY_PINECONE_INDEX_NAME (defaults to "daisy")
  - DAISY_PINECONE_NAMESPACE (defaults to "default")

```bash
npm install -g @answerai/daisy
```

#### Change your directory to your desired repo

```bash
  cd your_path_here
```

#### Run D.A.I.S.Y.

```bash
daisy start -full
```

It will then count the tokens and give you a cost estimate. When you say yes, it will go through all of your files and magic... automated documentation!

### Configuration

Sure! Here's a table that describes the properties and values in the configuration file:

| Constant name            | Description                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeBasePath`           | A string representing the base path of the code.                                                                                                        |
| `pineconeIndexName`      | A string representing the name of the Pinecone index.                                                                                                   |
| `pineconeNamespace`      | A string representing the namespace of the Pinecone index.                                                                                              |
| `daisyDirectoryName`   | A string representing the name of the D.A.I.S.Y. directory.                                                                                                |
| `daisyDirectory`       | A string representing the file path of the D.A.I.S.Y. directory.                                                                                           |
| `markdownDirectory`      | A string representing the file path of the Markdown directory.                                                                                          |
| `promptsFilePath`        | A string representing the file path of the prompts file.                                                                                                |
| `templateFilePath`       | A string representing the file path of the template file.                                                                                               |
| `packageJsonPath`        | A string representing the file path of the package.json file.                                                                                           |
| `invalidPaths`           | An array of strings representing invalid file paths.                                                                                                    |
| `invalidFileTypes`       | An array of strings representing invalid file types.                                                                                                    |
| `invalidFileNames`       | An array of strings representing invalid file names.                                                                                                    |
| `fileTypes`              | An object containing key-value pairs representing different file types and their associated properties, such as file types, prompt, and template files. |
| `fileTypes.docs`         | An object representing documentation file types and their associated properties.                                                                        |
| `fileTypes.react`        | An object representing React file types and their associated properties.                                                                                |
| `fileTypes.api`          | An object representing API file types and their associated properties.                                                                                  |
| `fileTypes.config`       | An object representing configuration file types and their associated properties.                                                                        |
| `fileTypes.script`       | An object representing script file types and their associated properties.                                                                               |
| `fileTypes.contentModel` | An object representing content model file types and their associated properties.                                                                        |
| `fileTypes.default`      | An object representing the default file type and its associated properties.                                                                             |

To execute the command on a single file

```bash
daisy start /path/to/file
```

## Commands

D.A.I.S.Y. has several commands that you can use to interact with it.

### `daisy save`

The `save` command allows you to save your code into pinecone memory

```bash
daisy save
```

### `daisy list`

The `list` command allows you to list all of the files that you have saved.

```bash
daisy list
```

## TODO Items

### CLI

- Add husky job to save to autodocument the change, allow the user to change the comment then pinecone on commit
- Classify files based on the area of the site using the embedding API
- Enable automated syncing to pincone without embeddings on when a file changes
- handle files over 8k in tokens
- Git action for pull requests that auto create the change log documentation based on the commit history and path file
-

### UI

- Add ability to select files to use in completion
- Show the user how many tokens they can have in the completion based on what files, model, and prompt they have selected

### Oberservations:
- I noticed that getting the correct folder structure is hard to get. I want to add a directory tree to the documentation that gets sent with each request for debugging and teaching purposes