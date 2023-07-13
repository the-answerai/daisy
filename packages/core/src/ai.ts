import { DaisyConfig } from "./types";

// openai-api.js
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";
import axios, { AxiosResponse } from "axios";

export type CreateAnswerAiChatCompletionProps = {
  model: string;
  messages: ChatCompletionRequestMessage[];
  temperature: number;
  config: DaisyConfig;
};

export type CreateOpenAiChatCompletionProps = {
  model: string;
  messages: ChatCompletionRequestMessage[];
  temperature: number;
  openAi: OpenAIApi;
};

export const createAnswerAiChatCompletion = async ({
  model,
  messages,
  temperature,
  config,
}: CreateAnswerAiChatCompletionProps) => {
  if (!config.answerAI?.apiKey) {
    console.error("No AnswerAI API key found in config");
    return;
  }
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
    .catch((error: any) => {
      console.error("Error in createAnswerAiChatCompletion API:", error);
    });

  return completion;
};

export const createOpenAiChatCompletion = async ({
  model,
  messages,
  temperature,
  openAi,
}: CreateOpenAiChatCompletionProps): Promise<any> => {
  const completion = await openAi
    .createChatCompletion({
      model,
      messages,
      temperature: temperature,
    })
    .catch((error: any) => {
      console.error(
        "Error in createOpenAiChatCompletion API:",
        error?.response?.data
      );
      // console.error('Error in createChatCompletion API:', error);
    });

  return completion;
};

export type CreateChatCompletionProps = {
  model: string;
  prompt: string;
  temperature?: number;
  config: DaisyConfig;
  openAi?: OpenAIApi;
};

export const createChatCompletion = async ({
  model,
  prompt,
  temperature = 0,
  config,
  openAi,
}: CreateChatCompletionProps) => {
  // TODO: Make the system prompt dynamic
  if (!prompt) {
    return null;
  }
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "You are a code documentation expert." },
      // { role: 'user', content: 'write me a readme file for vscode' }
      { role: "user", content: prompt },
    ];

    const completion = config.answerAI?.apiKey
      ? await createAnswerAiChatCompletion({
          model,
          messages,
          temperature,
          config,
        })
      : openAi
      ? await createOpenAiChatCompletion({
          model,
          messages,
          temperature,
          openAi,
        })
      : null;

    return completion;
  } catch (error) {
    console.error("Error in createChatCompletion:", error);
    // console.error('Error in createChatCompletion:', error);
  }
};

export type CreateEmbeddingProps = {
  model: string;
  input: string;
  openAi: OpenAIApi;
};

export const createOpenAiEmbedding = async ({
  model,
  input,
  openAi,
}: CreateEmbeddingProps): Promise<any> => {
  if (input) {
    try {
      const response = await openAi.createEmbedding({
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
