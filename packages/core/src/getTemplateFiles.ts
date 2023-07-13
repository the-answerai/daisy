import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

export const readTemplateFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf-8");
  return content;
};

export const getTemplateFiles = async (templateFilePath: string) => {
  const templateFiles = await readdir(templateFilePath);

  const templates: Record<string, string> = {};

  for (const file of templateFiles) {
    const filePath = join(templateFilePath, file);
    const content = await readTemplateFile(filePath);
    const fileNameWithoutExtension = parse(file).name;
    templates[fileNameWithoutExtension] = content;
  }

  return templates;
};
