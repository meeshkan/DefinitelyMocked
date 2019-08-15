import path from "path";
import * as utils from "../utils";
import { fold, Option, none, some } from "fp-ts/lib/Option";

const TEST_SERVICE = "test-service";
const serviceDir = path.resolve(__dirname, "services", "test-service");

const get = <A>(option: Option<A>): A => {
  return fold(
    () => {
      throw Error("No value");
    },
    (a: A) => a
  )(option);
};

describe("utils", () => {
  describe("for package.json", () => {
    it("reads package.json from given directory", () => {
      const packageJsonOpt = utils.readPackageJson(serviceDir);
      const packageJson = get(packageJsonOpt);
      expect(packageJson).toHaveProperty("version", "1.0.1");
    });
    it("creates package.json when none exists", () => {
      const packageJson = utils.mergePackageJsons({ service: TEST_SERVICE, source: none });
      expect(packageJson).toHaveProperty("version", "1.0.0");
      expect(packageJson).toHaveProperty("name", `@unmock/${TEST_SERVICE}`);
    });
    it("merges package.json when one exists", () => {
      const sourcePackageJson = { version: "2.0.0" };
      const packageJson = utils.mergePackageJsons({ service: TEST_SERVICE, source: some(sourcePackageJson) });
      expect(packageJson).toHaveProperty("version", "2.0.0");
      expect(packageJson).toHaveProperty("name", `@unmock/${TEST_SERVICE}`);
    });
  });
});
