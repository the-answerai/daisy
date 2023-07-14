import { getTemplateFiles, readTemplateFile } from "./getTemplateFiles";
import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

jest.mock("fs/promises", () => ({
  readdir: jest.fn(),
  readFile: jest.fn().mockResolvedValue("mocked JavaScript template content"),
}));

jest.mock("path", () => ({
  join: jest.fn(),
  parse: jest.fn(),
}));

describe("Utils", () => {
  describe("getTemplateFiles", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should return an object with the template files content", async () => {
      (readdir as jest.Mock).mockResolvedValue([
        "template1.txt",
        "template2.txt",
      ]);
      (join as jest.Mock).mockImplementation((...args) => args.join("/"));
      (parse as jest.Mock).mockImplementation((file) => ({
        name: file.split(".")[0],
      }));
      (readFile as jest.Mock).mockImplementation((filePath) => {
        const fileName = filePath.split("/").pop();
        return Promise.resolve(`${fileName} content`);
      });

      const result = await getTemplateFiles("templateFilePath");
      expect(result).toEqual({
        template1: "template1.txt content",
        template2: "template2.txt content",
      });

      expect(readdir).toHaveBeenCalledWith("templateFilePath");
      expect(join).toHaveBeenCalledTimes(2);
      expect(readFile).toHaveBeenCalledTimes(2);
      expect(parse).toHaveBeenCalledTimes(2);
    });
  });

  describe("readTemplateFile", () => {
    it("should read the content of a file", async () => {
      (readFile as jest.Mock).mockImplementation(() =>
        Promise.resolve("file content")
      );

      const result = await readTemplateFile("filePath");
      expect(result).toEqual("file content");
      expect(readFile).toHaveBeenCalledWith("filePath", "utf-8");
    });
  });
});
