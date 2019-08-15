import fs from "fs";
import os from "os";
import path from "path";
import prepareMain, { prepare, resolveOptions, DEFAULT_PREPARE_DIR, DEFAULT_SERVICE_DIR } from "../prepare";

/**
 * Remove directory recursively, with additional safeguards for testing it's a tmp dir.
 * @param {string} directory
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimrafTmp(directory: string) {
  if (!directory.startsWith(`${os.tmpdir()}${path.sep}`)) {
    throw Error("Trying to delete non-tmp directory!");
  }
  fs.readdirSync(directory).forEach((entry: string) => {
    const entryPath = path.join(directory, entry);
    if (fs.lstatSync(entryPath).isDirectory()) {
      rimrafTmp(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  });
  fs.rmdirSync(directory);
}

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
      if (typeof tmpFolder !== "undefined") {
        console.log(`Deleting directory: ${tmpFolder}`);
        rimrafTmp(tmpFolder);
        expect(fs.existsSync(tmpFolder)).toBe(false);
      }
    });
  });
});
