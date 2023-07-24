import fs from "fs";
import path from "path";
import { DaisyConfig } from "./types";

export const initConfigFile = async (
  codeBasePath: string
): Promise<DaisyConfig> => {
  // Copy the default config file over if it doesn't exist
  const localConfigPath = path.join(codeBasePath, ".daisyrc");
  const defaultConfigPath = path.join(__dirname, "../resources/daisyrc");

  if (!fs.existsSync(localConfigPath)) {
    fs.copyFileSync(defaultConfigPath, localConfigPath);
  }
  const fileConfig = require(localConfigPath);
  return fileConfig(codeBasePath); // Call the fileConfig function with CODE_BASE_PATH argument
};

export const copyFolderSync = (src: string, dest: string): void => {
  // Helper function to copy a folder recursively
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

export const initFolder = (targetPath: string, sourcePath: string): void => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  // copy each file if it does not exist
  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
  for (const entry of entries) {
    // copy the file if it doesn't exist
    const srcPath = path.join(sourcePath, entry.name);
    const destPath = path.join(targetPath, entry.name);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

export const initPromptsFolder = (config: DaisyConfig): void =>
  initFolder(
    config.promptsFilePath,
    path.join(__dirname, "../resources/prompts")
  );

export const initTemplatesFolder = (config: DaisyConfig): void =>
  initFolder(
    config.templateFilePath,
    path.join(__dirname, "../resources/templates")
  );

export const init = async (codeBasePath: string): Promise<DaisyConfig> => {
  const config = await initConfigFile(codeBasePath);

  initPromptsFolder(config);
  initTemplatesFolder(config);

  return config;
};
