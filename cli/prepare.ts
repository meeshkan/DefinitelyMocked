import chalk from "chalk";
import debug from "debug";
import fs from "fs";
import path from "path";
import { format } from "util";
import {
  copyFiles,
  createPackageJson,
  writeToFile,
  createReadme,
  ensureTargetDirectory,
} from "./utils";
import { IO } from "fp-ts/lib/IO";

export const DEFAULT_PREPARE_DIR = "prepared";

const color = (firstArg: any, ...args: any[]) =>
  chalk.bold.magenta(format(firstArg, ...args));

const log = (firstArg: any, ...args: any[]) =>
  console.log(color(firstArg, ...args));

const debugLog = debug("cli");

interface PrepareOptions {
  outDir: string;
}

const existsDir = (directory: string) => {
  return fs.existsSync(directory) && fs.statSync(directory).isDirectory();
};

const resolveServiceDefinitionDirectory = (service: string) => {
  return path.resolve(__dirname, "..", "services", service);
};

const prepare = (service: string, opts: Partial<PrepareOptions>) => {
  /**
   * Resolve where to read files
   */
  const serviceDefinitionDirectory = resolveServiceDefinitionDirectory(service);
  console.log(`Reading from: ${color(serviceDefinitionDirectory)}`);

  if (!existsDir(serviceDefinitionDirectory)) {
    throw Error(`Could not find directory: ${serviceDefinitionDirectory}`);
  }

  /**
   * Resolve where to write files
   */

  const targetBaseDirectory = (opts && opts.outDir) || DEFAULT_PREPARE_DIR;
  console.log(
    `Preparing service "${color(service)}", outputDirectory: ${color(
      targetBaseDirectory
    )}`
  );

  const resolvedTargetBase = path.resolve(process.cwd(), targetBaseDirectory);

  const {
    targetServiceDirectory: targetDirectory,
    createDirectoryOps: createTargetDirectory,
  } = ensureTargetDirectory({
    service,
    targetBase: resolvedTargetBase,
  });

  console.log(`Writing to: ${color(targetDirectory)}`);

  const copyFilesOp: IO<void[]> = copyFiles({
    source: serviceDefinitionDirectory,
    targetDir: targetDirectory,
    pattern: /ya?ml$/,
  });

  const packageJson = createPackageJson({
    sourceDir: serviceDefinitionDirectory,
    service,
  });

  console.log(
    "Prepared package json:\n",
    color(JSON.stringify(packageJson, null, 2))
  );

  const writePackageJsonOp: IO<void> = writeToFile({
    contents: packageJson,
    targetFile: path.resolve(targetDirectory, "package.json"),
  });

  const readme = createReadme({
    service,
  });

  const writeReadmeOp: IO<void> = writeToFile({
    contents: readme,
    targetFile: path.resolve(targetDirectory, "README.md"),
  });

  console.log("Writing...");

  createTargetDirectory();
  copyFilesOp();
  writePackageJsonOp();
  writeReadmeOp();

  console.log(`Prepared package in: ${color(targetDirectory)}`);
};

export default prepare;
