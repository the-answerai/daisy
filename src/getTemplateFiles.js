const fs = require('fs').promises;
const path = require('path');

const readTemplateFile = async (fs, filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
};

const getTemplateFiles = async (templateFilePath, fsModule = fs, pathModule = path) => {
  const templateFiles = await fsModule.readdir(templateFilePath);

  const templates = {};

  for (const file of templateFiles) {
    const filePath = pathModule.join(templateFilePath, file);
    const content = await readTemplateFile(fsModule, filePath);
    const fileNameWithoutExtension = pathModule.parse(file).name;
    templates[fileNameWithoutExtension] = content;
  }

  return templates;
};

module.exports = {
  getTemplateFiles,
  readTemplateFile,
};
