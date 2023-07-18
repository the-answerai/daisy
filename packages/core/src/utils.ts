import { readFile } from "fs/promises";
import {} from "path";
import he from "he";
import GPT3Tokenizer from "gpt3-tokenizer";
import Handlebars from "handlebars";

import { getTemplateFiles } from "./getTemplateFiles";
import {
  DaisyConfig,
  FileData,
  FileTypeDefinition,
  FileTypeObject,
} from "./types";
import { exec } from "child_process";

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });

const templateCompiler = (content: string) => {
  return Handlebars.compile(content);
};

const fileReader = async (filePath: string) => {
  return await readFile(filePath, "utf-8");
};

export const countTokens = (content: string) => {
  const encoded = tokenizer.encode(content);
  const tokensInFile = encoded.bpe.length;
  return tokensInFile;
};

export type CompileCompletionPromptsProps = {
  filePath: string;
  prompt?: string;
  skipCompletion: boolean;
  config: DaisyConfig;
};

export const compileCompletionPrompts = async ({
  filePath,
  prompt,
  skipCompletion,
  config,
}: CompileCompletionPromptsProps) => {
  try {
    const fileContents = await fileReader(filePath);
    let fullPrompt: string | undefined;
    if (!skipCompletion) {
      const templateFiles = await getTemplateFiles(config.templateFilePath);
      const promptFile = `${config.promptsFilePath}/${prompt}`;
      const promptContent = await fileReader(promptFile);

      const compiledTemplate = templateCompiler(promptContent);
      const data = {
        templates: templateFiles,
        fileContents: fileContents,
      };
      fullPrompt = compiledTemplate(data);
      fullPrompt = he.decode(fullPrompt);
    }
    return {
      fullPrompt,
      fileContents,
    };
  } catch (err) {
    console.log("Error in compileCompletionPrompts", err);
  }
};

// TODO: Configure this so that it can be used for other models
// TODO: Calculate the true token size based on the prompt and
export const getCompletionModelBasedOnTokenSize = (tokens: number) => {
  // If-else statement to determine which model to use
  if (tokens >= 0 && tokens <= 15000) {
    return "gpt-3.5-turbo-16k";
  } else {
    return null;
  }
};

// If-else statement to determine the cost of the completion request
// TODO: This is only calculating context tokens, not the response tokens
export const getEstimatedPricing = (model: string, tokens: number) => {
  if (model === "gpt-3.5-turbo" || model === "gpt-3.5-turbo-16k") {
    return ((tokens / 1000) * 0.002).toFixed(4);
  } else if (model === "gpt-4") {
    return ((tokens / 1000) * 0.06).toFixed(4);
  } else {
    return null;
  }
};

export function generateCostSummary(files: FileData[]) {
  let gpt4Files = 0;
  let gpt4Cost = 0;
  let gpt35Files = 0;
  let gpt35Cost = 0;
  let skippedTokens = 0;
  let skippedCompletion = 0;

  files.forEach((file) => {
    if (file.skipCompletion) {
      skippedCompletion++;
      return; // Skip the rest of the loop iteration for this file
    }

    // Calculate cost based on model and tokens
    const gpt4Rate = 0.06; // Rate per 1000 tokens for GPT-4
    const gpt35Rate = 0.002; // Rate per 1000 tokens for GPT-3.5

    if (file.model === "gpt-4") {
      gpt4Files++;
      gpt4Cost += (file.tokens / 1000) * gpt4Rate;
    } else if (
      file.model === "gpt-3.5-turbo" ||
      file.model === "gpt-3.5-turbo-16k"
    ) {
      gpt35Files++;
      gpt35Cost += (file.tokens / 1000) * gpt35Rate;
    }

    skippedTokens += file.tokens;
  });

  return `
    GPT-4: Number of files: ${gpt4Files}
    GPT-4: Total Cost: $${gpt4Cost.toFixed(4)}
    GPT-3.5: Number of Files: ${gpt35Files}
    GPT-3.5: Total Cost: $${gpt35Cost.toFixed(4)}
    Files Skipped: tokens ${skippedTokens}
    Files Skipped: skipCompletion ${skippedCompletion}
  `;
}

export const execAsync = (command: string, cwd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout ? stdout.trim() : "");
    });
  });
};
