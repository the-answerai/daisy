# D.A.I.S.Y. CLI

The D.A.I.S.Y. CLI package allows you to use AI to document your codebase and submit it to the AnswerAI API for searchability within the platform.

## Installation

To install the D.A.I.S.Y. CLI package, use the following command:

```bash
npm install -g @answerai/daisy
```

## Usage

To use the D.A.I.S.Y. CLI, run the daisy command followed by the desired options and commands. Here are the available commands and options:

```
Usage: daisy [options] [command]

Options:
  -h, --help       display help for command

Commands:
  start [options]  Start D.A.I.S.Y.
  mem              Memorize to Pinecone
  update           Update changed files
  help [command]   display help for command

```

### start

```
Usage: daisy start [options]

Start D.A.I.S.Y.

Options:
  -i, --input <path>  Path to the file or directory to be documented. leave blank to run against the entire code base
  -y, --yes           Skip the confirmation prompts and proceed with the magic
  -h, --help          display help for command

```

### mem

```
Usage: daisy mem [options]

Memorize to Pinecone

Options:
  -h, --help  display help for command

```

### update

```
Usage: daisy update [options]

Update changed files

Options:
  -h, --help  display help for command

```

## Configuration

The D.A.I.S.Y. CLI package requires a configuration file named .daisyrc at the root of the project. If one is not there, a default one will be created.

## Environement variables

- `PINECONE_INDEX_NAME` | index name if using pinecone and openAi APIs directly | defaults to 'daisy'
- `PINECONE_NAMESPACE` | namespace if using pinecone and openAi APIs directly | defaults to 'default'
- `DAISY_DIRECTORY_NAME` | directory where daisy files will be created | defaults to 'daisy'
- `MARKDOWN_DIRECTORY` | directory where markdown files are stored | defailts to 'markdown' within the daisy directory
- `PROMPTS_FILE_PATH` | directory where prompt files are stored | defaults to 'prompts' within the daisy directory
- `TEMPLATE_FILE_PATH` | directory where template files are stored | defaults to 'templates' within the daisy directory
- `ANSWERAI_API_KEY` | anwerai api key when using answerai API | required when using the answerAI API
- `OPENAI_API_KEY` | openai api key when using pinecone and openAi APIs directly | required when using the pinecone and openAi APIs directly
- `PINECONE_API_KEY` | pinecone api key when using pinecone and openAi APIs directly | required when using the pinecone and openAi APIs directly
- `PINECONE_ENVIRONMENT` | pinecone environment using pinecone and openAi APIs directly | required when using the pinecone and openAi APIs directly

## examples

```bash
daisy start # runs full daisy process and asks for confirmation at certain steps
```

```bash
daisy start -y # runs full daisy process does not ask for confirmation
```

```bash
daisy start -i src/index.ts # runs fulldaisy process on src.index.ts file
```

```bash
daisy mem # does not do file completion, just runs the memorization process
```

```bash
daisy update # runs the full daisy process only on files that have changed
```
