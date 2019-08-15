import fs from "fs";
import os from "os";
import path from "path";
import prepareMain, { prepare, resolveOptions, DEFAULT_PREPARE_DIR, DEFAULT_SERVICE_DIR } from "../prepare";

describe("Prepare", () => {
  describe("options", () => {
    it("should resolve correctly when none given", () => {
      const options = resolveOptions({});
      const expectedOutBaseDir = path.resolve(process.cwd(), DEFAULT_PREPARE_DIR);
      expect(options.outBaseDir).toEqual(expectedOutBaseDir);
      const expectedServiceDir = path.resolve(process.cwd(), DEFAULT_SERVICE_DIR);
      expect(options.servicesDir).toEqual(expectedServiceDir);
    });
    it("should respect given paths", () => {
      const options = resolveOptions({
        outBaseDir: "__test__",
        servicesDir: "__services__",
      });
      const expectedOutBaseDir = path.resolve(process.cwd(), "__test__");
      expect(options.outBaseDir).toEqual(expectedOutBaseDir);
      const expectedServiceDir = path.resolve(process.cwd(), "__services__");
      expect(options.servicesDir).toEqual(expectedServiceDir);
    });
  });
  describe("script smoke test", () => {
    it("should run successfully for test folder", () => {
      const testService = "test-service";
      const { targetDirectory, ops } = prepare(testService, {
        servicesDir: "tests/services",
        outBaseDir: "tests/prepared",
      });
      const expectedTargetDirectory = path.resolve(process.cwd(), "tests/prepared", testService);
      expect(targetDirectory).toBe(expectedTargetDirectory);
      expect(ops).toBeDefined();
    });
  });
  describe("writing to tmp directory", () => {
    let tmpFolder: string;
    beforeAll(() => {
      tmpFolder = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    });
    it("should write files as expected", () => {
      const testService = "test-service";
      prepareMain(testService, {
        servicesDir: "tests/services",
        outBaseDir: tmpFolder,
      });
      const expectedWrittenDir = path.resolve(tmpFolder, testService);
      if (!fs.existsSync(expectedWrittenDir)) {
        throw Error(`Directory does not exist: ${expectedWrittenDir}`);
      }
      const files = fs.readdirSync(expectedWrittenDir);
      expect(files).toContain("openapi.yaml");
      expect(files).toContain("package.json");
      expect(files).toContain("README.md");
    });
    afterAll(() => {
      // Delete tmp folder
    });
  });
});
