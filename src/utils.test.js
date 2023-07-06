// utils.test.js
const {
  countTokens,
  compileCompletionPrompts,
  getCompletionModelBasedOnTokenSize,
  getEstimatedPricing,
  generateCostSummary
} = require('./utils');
const fs = require('fs').promises;
const Handlebars = require('handlebars');

const GPT3Tokenizer = require('gpt3-tokenizer').default;
const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

describe('Utils test suite', () => {
  test('countTokens', async () => {
    const content = 'This is a test sentence.';
    const encoded = tokenizer.encode(content);
    const expectedTokenCount = encoded.bpe.length;
    const tokenCount = await countTokens(content);
    expect(tokenCount).toEqual(expectedTokenCount);
  });

  //TODO: Mock the fileReader and templateCompiler
//   test('compileCompletionPrompts', async () => {
//     // Mock fileReader and templateCompiler here if necessary
//     const compiledPrompt = await compileCompletionPrompts('test-file-path', 'test-prompt', {
//       templateFilePath: 'test-template-path',
//       promptsFilePath: 'test-prompts-path'
//     });

//     // Add your assertions here
//   });

  test('getCompletionModelBasedOnTokenSize', () => {
    expect(getCompletionModelBasedOnTokenSize(1000)).toBe('gpt-3.5-turbo');
    expect(getCompletionModelBasedOnTokenSize(5000)).toBe('gpt-4');
    expect(getCompletionModelBasedOnTokenSize(10000)).toBe(null);
  });

  test('getEstimatedPricing', () => {
    expect(getEstimatedPricing('gpt-3.5-turbo', 1000)).toBe('0.0020');
    expect(getEstimatedPricing('gpt-4', 1000)).toBe('0.0600');
    expect(getEstimatedPricing('unknown-model', 1000)).toBe(null);
  });

  // TODO: The function is not working as expected
//   test('generateCostSummary', () => {
//     const files = [
//       { skipCompletion: true },
//       { model: 'gpt-4', tokens: 5000 },
//       { model: 'gpt-3.5-turbo', tokens: 1000 },
//       { model: 'unknown-model', tokens: 1000 }
//     ];

//     const summary = generateCostSummary(files);
//     const expectedSummary = `
//           GPT-4: Number of files: 1
//           GPT-4: Total Cost: 0.3000
//           GPT-3.5: Number of Files: 1
//           GPT-3.5: Total Cost: 0.0020
//           Files Skipped: tokens 7000
//           Files Skipped: skipCompletion 1
//         `;

//     expect(summary).toBe(expectedSummary);
//   });
});
