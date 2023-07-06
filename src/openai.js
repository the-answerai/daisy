// openai-api.js
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const createAnswerAiChatCompletion = async ({
  model,
  messages,
  temperature,
  config,
}) => {
  const completion = await axios
    .post(
      config.answerAI.chatCompletionUrl,
      {
        model,
        messages,
        temperature: temperature,
      },
      {
        headers: {
          contentType: "application/json",
          authorization: `Bearer ${config.answerAI.apiKey}`,
        },
      }
    )
    .catch((error) => {
      console.error("Error in createAnswerAiChatCompletion API:", error);
    });

  return completion;
};

const createOpenAiChatCompletion = async ({ model, messages, temperature }) => {
  const completion = await openai
    .createChatCompletion({
      model,
      messages,
      temperature: temperature,
    })
    .catch((error) => {
      console.error(
        "Error in createOpenAiChatCompletion API:",
        error?.response?.data
      );
      // console.error('Error in createChatCompletion API:', error);
    });

  return completion;
};

const createChatCompletion = async ({
  gptModel,
  prompt,
  temperature = 0,
  config,
}) => {
  // TODO: Make the system prompt dynamic
  if (!prompt) {
    return null;
  }
  try {
    const messages = [
      { role: "system", content: "You are a code documentation expert." },
      // { role: 'user', content: 'write me a readme file for vscode' }
      { role: "user", content: prompt },
    ];
    const completion = config.answerAI?.apiKey
      ? await createAnswerAiChatCompletion({
          model: gptModel,
          messages,
          temperature,
          config,
        })
      : await createOpenAiChatCompletion({
          model: gptModel,
          messages,
          temperature,
        });

    return completion;
  } catch (error) {
    console.error("Error in createChatCompletion:", error);
    // console.error('Error in createChatCompletion:', error);
  }
};

const createEmbedding = async ({ model, input }) => {
  if (input) {
    try {
      const response = await openai.createEmbedding({
        model,
        input,
      });

      return response;
    } catch (error) {
      console.error("Error in createEmbedding:", error);
    }
  } else {
    return null;
  }
};

module.exports = {
  createEmbedding,
  createChatCompletion,
};
