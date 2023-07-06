const { getTemplateFiles, readTemplateFile } = require('./getTemplateFiles');
const fs = require('fs').promises;
const path = require('path');

jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    promises: {
      readdir: jest.fn(),
      readFile: jest.fn(),
    },
  };
});

jest.mock('path', () => ({
  join: jest.fn(),
  parse: jest.fn(),
}));


describe('Utils', () => {
  describe('getTemplateFiles', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return an object with the template files content', async () => {
      fs.readdir.mockImplementation(() => Promise.resolve(['template1.txt', 'template2.txt']));
      path.join.mockImplementation((...args) => args.join('/'));
      path.parse.mockImplementation((file) => ({ name: file.split('.')[0] }));
      fs.readFile.mockImplementation((filePath) => {
        const fileName = filePath.split('/').pop();
        return Promise.resolve(`${fileName} content`);
      });

      const result = await getTemplateFiles('templateFilePath', fs, path);
      expect(result).toEqual({
        template1: 'template1.txt content',
        template2: 'template2.txt content',
      });

      expect(fs.readdir).toHaveBeenCalledWith('templateFilePath');
      expect(path.join).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(path.parse).toHaveBeenCalledTimes(2);
    });
  });

  describe('readTemplateFile', () => {
    it('should read the content of a file', async () => {
      fs.readFile.mockImplementation(() => Promise.resolve('file content'));

      const result = await readTemplateFile(fs, 'filePath');
      expect(result).toEqual('file content');
      expect(fs.readFile).toHaveBeenCalledWith('filePath', 'utf-8');
    });
  });
});
