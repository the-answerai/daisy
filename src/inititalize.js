const fs = require("fs");
const path = require("path");

const CODE_BASE_PATH = process.env.CODE_BASE_PATH || process.cwd();

const initConfigFile = async (folderPath) => {
  // Copy the default config file over if it doesn't exist
  const localConfigPath = path.join(folderPath, ".daisyrc");
  const defaultConfigPath = path.join(__dirname, ".daisyrc");

  if (!fs.existsSync(localConfigPath)) {
    fs.copyFileSync(defaultConfigPath, localConfigPath);
  }
  const fileConfig = require(localConfigPath);
  return fileConfig(CODE_BASE_PATH); // Call the fileConfig function with CODE_BASE_PATH argument
};

const copyFolderSync = (src, dest) => {
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

const initPromptsFolder = (config, folderPath) => {
  // Copy the prompts folder over if it doesn't exist
  const localPromptsPath = path.join(
    folderPath,
    config.daisyDirectoryName,
    "prompts"
  );
  const packagePromptsPath = path.join(__dirname, "prompts");

  if (!fs.existsSync(localPromptsPath)) {
    copyFolderSync(packagePromptsPath, localPromptsPath);
  }
};

const initTemplatesFolder = (config, folderPath) => {
  // Copy the templates folder over if it doesn't exist
  const localTemplatesPath = path.join(
    folderPath,
    config.daisyDirectoryName,
    "templates"
  );
  const packageTemplatesPath = path.join(__dirname, "templates");

  if (!fs.existsSync(localTemplatesPath)) {
    copyFolderSync(packageTemplatesPath, localTemplatesPath);
  }
};

const init = (folderPath) => {
  return new Promise(async (resolve) => {
    const config = await initConfigFile(folderPath);
    initPromptsFolder(config, folderPath);
    initTemplatesFolder(config, folderPath);

    resolve(config);
  });
};

module.exports = {
  init,
  initConfigFile,
  initPromptsFolder,
  initTemplatesFolder,
};
