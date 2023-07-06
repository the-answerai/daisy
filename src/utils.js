const fs = require("fs").promises;
const path = require("path");
const he = require("he");
const GPT3Tokenizer = require("gpt3-tokenizer").default;
const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
const { getTemplateFiles } = require("./getTemplateFiles");

const Handlebars = require("handlebars");

const templateCompiler = (content) => {
  return Handlebars.compile(content);
};

const fileReader = async (filePath) => {
  return await fs.readFile(filePath, "utf-8");
};

const countTokens = (content) => {
  return new Promise(async (resolve) => {
    const encoded = tokenizer.encode(content);
    const tokensInFile = encoded.bpe.length;
    resolve(tokensInFile);
  });
};

const compileCompletionPrompts = async (
  filePath,
  prompt,
  skipCompletion,
  { templateFilePath, promptsFilePath }
) => {
  try {
    const fileContents = await fileReader(filePath);
    let fullPrompt = null;
    if (!skipCompletion) {
      const templateFiles = await getTemplateFiles(templateFilePath);
      const promptFile = `${promptsFilePath}/${prompt}`;
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
const getCompletionModelBasedOnTokenSize = (tokens) => {
  // If-else statement to determine which model to use
  if (tokens >= 0 && tokens <= 15000) {
    return "gpt-3.5-turbo-16k";
  } else {
    return null;
  }
};

// If-else statement to determine the cost of the completion request
// TODO: This is only calculating context tokens, not the response tokens
const getEstimatedPricing = (model, tokens) => {
  if (model === "gpt-3.5-turbo" || model === "gpt-3.5-turbo-16k") {
    return ((tokens / 1000) * 0.002).toFixed(4);
  } else if (model === "gpt-4") {
    return ((tokens / 1000) * 0.06).toFixed(4);
  } else {
    return null;
  }
};

function generateCostSummary(files) {
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

module.exports = {
  countTokens,
  compileCompletionPrompts,
  getCompletionModelBasedOnTokenSize,
  getEstimatedPricing,
  generateCostSummary,
};
