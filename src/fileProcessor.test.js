const fs = require('fs').promises;
const path = require('path');
const { fileProcessor, getFileType, isInvalidFile } = require('./fileProcessor');
const getTemplateFilesModule = require('./getTemplateFiles');

jest.mock('./getTemplateFiles');

jest.mock('fs', () => {
  return {
    promises: {
      readdir: jest.fn().mockResolvedValue(['testFile.js']),
      stat: jest.fn().mockResolvedValue({ isDirectory: () => false }),
      readFile: jest.fn().mockResolvedValue('mocked JavaScript template content')
    }
  };
});


const config = {
  codeBasePath: '/test/codeBase',
  invalidPaths: ['invalidDir'],
  invalidFileTypes: ['.txt'],
  invalidFileNames: ['invalidName.js'],
  templatesFilePath: '/test/templates',
  promptsFilePath: '/test/prompts',
  fileTypes: {
    js: {
      fileTypes: ['.js'],
      prompt: 'JavaScript Prompt',
      template: 'JavaScript Template',
      skipCompletion: false
    }
  }
};

describe('fileProcessor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // ...
    // Add the mock implementation for getTemplateFiles
    getTemplateFilesModule.getTemplateFiles.mockImplementation(() =>
      Promise.resolve({
        'JavaScript Template': 'mocked JavaScript template content'
      })
    );
  });

  test('processes files correctly', async () => {
    const dirPath = '/test/codeBase';
    const filePath = path.join(dirPath, 'testFile.js');

    const result = await fileProcessor(dirPath, config);

    expect(fs.readdir).toHaveBeenCalledWith(dirPath);
    expect(fs.stat).toHaveBeenCalledWith(filePath);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      filePath,
      type: 'js',
      prompt: 'JavaScript Prompt',
      template: 'JavaScript Template',
      skipCompletion: false
    });
  });
});

describe('getFileType', () => {
  test('returns correct file type', () => {
    const filePath = '/test/codeBase/someFile.js';
    const fileType = getFileType(filePath, config);

    expect(fileType).toMatchObject({
      type: 'js',
      prompt: 'JavaScript Prompt',
      template: 'JavaScript Template',
      skipCompletion: false
    });
  });
});

describe('isInvalidFile', () => {
  test('identifies invalid files correctly', () => {
    const invalidFile1 = '/test/codeBase/invalidDir/invalidFile.js';
    const invalidFile2 = '/test/codeBase/someDir/invalidName.js';
    const invalidFile3 = '/test/codeBase/someDir/invalidFile.txt';
    const validFile = '/test/codeBase/someDir/validFile.js';

    expect(isInvalidFile(invalidFile1, config)).toBe(true);
    expect(isInvalidFile(invalidFile2, config)).toBe(true);
    expect(isInvalidFile(invalidFile3, config)).toBe(true);
    expect(isInvalidFile(validFile, config)).toBe(false);
  });
});
