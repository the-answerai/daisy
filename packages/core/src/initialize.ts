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

export const initPromptsFolder = (
  config: DaisyConfig,
  folderPath: string
): void => {
  // Copy the prompts folder over if it doesn't exist
  const localPromptsPath = path.join(
    folderPath,
    config.daisyDirectoryName,
    "prompts"
  );
  const packagePromptsPath = path.join(__dirname, "../resources/prompts");

  if (!fs.existsSync(localPromptsPath)) {
    copyFolderSync(packagePromptsPath, localPromptsPath);
  }
};

export const initTemplatesFolder = (
  config: DaisyConfig,
  folderPath: string
): void => {
  // Copy the templates folder over if it doesn't exist
  const localTemplatesPath = path.join(
    folderPath,
    config.daisyDirectoryName,
    "templates"
  );
  const packageTemplatesPath = path.join(__dirname, "../resources/templates");

  if (!fs.existsSync(localTemplatesPath)) {
    copyFolderSync(packageTemplatesPath, localTemplatesPath);
  }
};

export const init = async (codeBasePath: string): Promise<DaisyConfig> => {
  const config = await initConfigFile(codeBasePath);
  initPromptsFolder(config, codeBasePath);
  initTemplatesFolder(config, codeBasePath);

  return config;
};
