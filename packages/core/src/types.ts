export type DaisyConfig = {
  codeBasePath: string;
  pineconeIndexName?: string;
  pineconeNamespace?: string;
  daisyDirectoryName: string;
  markdownDirectory: string;
  promptsFilePath: string;
  templateFilePath: string;
  openAiApiKey?: string;
  pineconeApiKey?: string;
  pineconeEnvironment?: string;

  answerAI?: {
    apiKey: string;
    embeddingsUrl: string;
    chatCompletionUrl: string;
  };
  invalidPaths: string[];
  invalidFileTypes: string[];
  invalidFileNames: string[];
  fileTypes: {
    [key: string]: FileTypeDefinition;
    default: FileTypeDefinition;
  };
};

export type FileTypeObject = {
  type: string;
  prompt?: string;
  template?: string;
  model?: string;
  skipCompletion: boolean;
};

export type FileGitInfo = {
  filePath: string;
  status: "A" | "M" | "D";
  gitDiff?: string;
};

export type ChangedFiles = {
  addedFiles: FileGitInfo[];
  modifiedFiles: FileGitInfo[];
  deletedFiles: FileGitInfo[];
};

export type FileTypeDefinition = {
  fileTypes?: string[];
  pathIncludes?: string[];
  prompt?: string;
  template?: string;
  skipCompletion?: boolean;
};

export type PackageJson = {
  name: string;
  version: string;
};

export type FileContents = {
  contents: string;
  filePath: string;
};

export type FileData = {
  filePath: string;
  type: string;
  prompt?: string;
  template?: string;
  skipCompletion: boolean;
  fullPrompt: string;
  fileContents?: string;
  tokens: number;
  model: string;
  cost: string;
};
