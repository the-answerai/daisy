import { readdir, stat, readFile } from "fs/promises";
import { resolve, join } from "path";
import {
  FileValidity,
  MAX_FILE_SIZE,
  fileProcessor,
  getFileType,
  getFileValidity,
} from "./fileProcessor";
import { getTemplateFiles } from "./getTemplateFiles";
import { DaisyConfig } from "./types";

jest.mock("fs/promises", () => ({
  readdir: jest.fn().mockResolvedValue(["testFile.js"]),
  stat: jest.fn(),
  readFile: jest.fn().mockResolvedValue("mocked JavaScript template content"),
}));

jest.mock("./getTemplateFiles", () => ({
  getTemplateFiles: jest.fn().mockResolvedValue({
    "JavaScript Template": "mocked JavaScript template content",
  }),
}));

const config: DaisyConfig = {
  codeBasePath: "/test/codeBase",
  invalidPaths: ["invalidDir"],
  invalidFileTypes: [".txt"],
  invalidFileNames: ["invalidName.js"],
  promptsFilePath: "/test/prompts",
  daisyDirectoryName: "./test/codeBase/daisy",
  markdownDirectory: "./test/codeBase/daisy/markdown",
  templateFilePath: "/test/codeBase/daisy/templates",
  fileTypes: {
    js: {
      fileTypes: [".js"],
      prompt: "JavaScript Prompt",
      template: "JavaScript Template",
      skipCompletion: false,
    },
    default: {
      prompt: "default.prompt",
      template: "default.md",
    },
  },
};

describe("fileProcessor", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // beforeEach(() => {});

  test("processes single file correctly", async () => {
    const dirPath = "/test/codeBase";
    const filePath = join(dirPath, "testFile.js");

    (stat as jest.Mock).mockResolvedValue({ isDirectory: () => false });

    const result = await fileProcessor(filePath, config);

    expect(stat).toHaveBeenCalledWith(filePath);
    expect(readdir).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      filePath,
      type: "js",
      prompt: "JavaScript Prompt",
      template: "JavaScript Template",
      skipCompletion: false,
    });
  });

  test("processes directory correctly", async () => {
    const dirPath = "/test/codeBase";

    (stat as jest.Mock)
      .mockResolvedValueOnce({ isDirectory: () => true })
      .mockResolvedValue({ isDirectory: () => false });

    const result = await fileProcessor(dirPath, config);

    expect(stat).toHaveBeenCalledWith(dirPath);
    expect(readdir).toHaveBeenCalledWith(dirPath);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      type: "js",
      prompt: "JavaScript Prompt",
      template: "JavaScript Template",
      skipCompletion: false,
    });
  });
});

describe("getFileType", () => {
  test("returns correct file type", () => {
    const filePath = "/test/codeBase/someFile.js";
    const fileType = getFileType(filePath, config);

    expect(fileType).toMatchObject({
      type: "js",
      prompt: "JavaScript Prompt",
      template: "JavaScript Template",
      skipCompletion: false,
    });
  });
});

describe("getFileValidity", () => {
  test("classifies file validity correctly", () => {
    const invalidFile1 = "/test/codeBase/invalidDir/invalidFile.js";
    const invalidFile2 = "/test/codeBase/someDir/invalidName.js";
    const invalidFile3 = "/test/codeBase/someDir/invalidFile.txt";
    const validFile = "/test/codeBase/someDir/validFile.js";
    const validContents = "valid file contents";

    let invalidContents = "";
    for (let i = 0; i < MAX_FILE_SIZE + 1; i++) {
      invalidContents += "a";
    }

    expect(
      getFileValidity({
        filePath: invalidFile1,
        config,
        fileContents: validContents,
      })
    ).toBe(FileValidity.InvalidPath);
    expect(
      getFileValidity({
        filePath: invalidFile2,
        config,
        fileContents: validContents,
      })
    ).toBe(FileValidity.InvalidFileName);
    expect(
      getFileValidity({
        filePath: invalidFile3,
        config,
        fileContents: validContents,
      })
    ).toBe(FileValidity.InvalidFileType);
    expect(
      getFileValidity({
        filePath: validFile,
        config,
        fileContents: validContents,
      })
    ).toBe(FileValidity.Valid);
    expect(
      getFileValidity({
        filePath: validFile,
        config,
        fileContents: invalidContents,
      })
    ).toBe(FileValidity.TooLarge);
  });
});
