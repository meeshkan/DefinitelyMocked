import path from "path";
import {
  prepare,
  resolveOptions,
  DEFAULT_PREPARE_DIR,
  DEFAULT_SERVICE_DIR,
} from "./prepare";

describe("Prepare script", () => {
  it("should resolve options correctly when none given", () => {
    const options = resolveOptions({});
    const expectedOutBaseDir = path.resolve(__dirname, DEFAULT_PREPARE_DIR);
    expect(options.outBaseDir).toEqual(expectedOutBaseDir);
    const expectedServiceDir = path.resolve(__dirname, DEFAULT_SERVICE_DIR);
    expect(options.servicesDir).toEqual(expectedServiceDir);
  });
});
