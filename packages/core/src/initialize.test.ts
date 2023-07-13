// test.js
import fs from "fs";
import path from "path";
import {
  init,
  initConfigFile,
  initPromptsFolder,
  initTemplatesFolder,
} from "./initialize";

// Helper function to delete the test folder if it exists
const deleteTestFolder = (folderPath: string) => {
  if (fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
  }
};

describe("D.A.I.S.Y. initialization", () => {
  const testFolder = path.join(__dirname, "test-daisy-folder");
  const daisyRcPath = path.join(testFolder, ".daisyrc");

  beforeEach(() => {
    // Clean up the test folder before each test
    deleteTestFolder(testFolder);
    if (!fs.existsSync(testFolder)) {
      fs.mkdirSync(testFolder);
    }
  });

  afterEach(() => {
    // Clean up the test folder after each test
    deleteTestFolder(testFolder);
  });

  test("initConfigFile initializes daisy successfully by creating a .daisyrc file with default configurations in the root directory", async () => {
    const config = await initConfigFile(testFolder);
    expect(fs.existsSync(daisyRcPath)).toBe(true);
  });

  test("initPromptsFolder creates the prompt folder with default prompts", async () => {
    const config = await initConfigFile(testFolder);
    initPromptsFolder(config, testFolder);
    const promptsPath = path.join(
      testFolder,
      config.daisyDirectoryName,
      "prompts"
    );
    expect(fs.existsSync(promptsPath)).toBe(true);
  });

  test("initTemplatesFolder creates the templates folder with default templates", async () => {
    const config = await initConfigFile(testFolder);
    initTemplatesFolder(config, testFolder);
    const templatesPath = path.join(
      testFolder,
      config.daisyDirectoryName,
      "templates"
    );
    expect(fs.existsSync(templatesPath)).toBe(true);
  });

  test("init initializes daisy with the correct folder structure and user config", async () => {
    const config = await init(testFolder);
    const daisyFolderPath = path.join(testFolder, config.daisyDirectoryName);
    const promptsPath = path.join(daisyFolderPath, "prompts");
    const templatesPath = path.join(daisyFolderPath, "templates");
    expect(fs.existsSync(daisyFolderPath)).toBe(true);
    expect(fs.existsSync(promptsPath)).toBe(true);
    expect(fs.existsSync(templatesPath)).toBe(true);
  });
});
