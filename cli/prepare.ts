import chalk from "chalk";
import debug from "debug";
import fs from "fs";
import path from "path";
import { format } from "util";
import { copyFiles, createPackageJson } from "./utils";
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

/**
 * Resolve absolute path to directory.
 * Uses `process.cwd()` as root for relative directory.
 * @param directory
 */
const resolveTargetDirectory = (directory: string) => {
  return path.resolve(process.cwd(), directory);
};

/**
 * Ensure directory exists.
 * @param directory Absolute path to directory
 */
const ensureDirectory = (directory: string) => {
  if (!path.isAbsolute(directory)) {
    throw Error(`Expected absolute path, got ${directory}`);
  }

  if (fs.existsSync(directory)) {
    fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK);
    if (!fs.statSync(directory).isDirectory()) {
      throw Error(`Directory ${directory} exists but is not a directory`);
    }
    debugLog(`Directory exists: ${directory}`);
    return;
  }

  log(`Creating directory: ${directory}`);
  fs.mkdirSync(directory);
  fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK);
};

const existsDir = (directory: string) => {
  return fs.existsSync(directory) && fs.statSync(directory).isDirectory();
};

/**
 * Resolve target directory and ensure it exists.
 * @param service Service name, used as target directory in target base
 * @param targetBaseDirectory Relative or absolute path to where output should be written
 */
const ensureTargetDirectory = ({
  targetBase,
  service,
}: {
  targetBase: string;
  service: string;
}) => {
  // Resolve absolute path to base directory: "/path/to/base"
  const resolvedTargetBaseDirectory = resolveTargetDirectory(targetBase);

  debugLog(`Resolved target directory: ${resolvedTargetBaseDirectory}`);

  ensureDirectory(resolvedTargetBaseDirectory);

  // Resolve absolute path to target directory: "/path/to/base/service-name"
  const targetServiceDirectory = path.resolve(
    resolvedTargetBaseDirectory,
    service
  );

  ensureDirectory(targetServiceDirectory);

  return targetServiceDirectory;
};

const resolveServiceDefinitionDirectory = (service: string) => {
  return path.resolve(__dirname, "..", "services", service);
};

const prepare = (service: string, opts: Partial<PrepareOptions>) => {
  const targetBaseDirectory = (opts && opts.outDir) || DEFAULT_PREPARE_DIR;
  console.log(
    `Preparing service "${color(service)}", outputDirectory: ${color(
      targetBaseDirectory
    )}`
  );

  const serviceDefinitionDirectory = resolveServiceDefinitionDirectory(service);
  console.log(`Reading from: ${color(serviceDefinitionDirectory)}`);

  if (!existsDir(serviceDefinitionDirectory)) {
    throw Error(`Could not find directory: ${serviceDefinitionDirectory}`);
  }

  const targetDirectory = ensureTargetDirectory({
    service,
    targetBase: targetBaseDirectory,
  });
  console.log(`Writing to: ${color(targetDirectory)}`);

  // TODO
  // 1. Copy all yamls and jsons
  // 2. Prepare package.json and write to directory
  // 3. Add README.md

  const copyFilesOp: IO<void[]> = copyFiles({
    source: serviceDefinitionDirectory,
    targetDir: targetDirectory,
    pattern: /ya?ml$/,
  });

  // copyFilesOp();

  const packageJson = createPackageJson({
    sourceDir: serviceDefinitionDirectory,
    service,
  });

  console.log(`Prepared package json: ${JSON.stringify(packageJson)}`);
};

export default prepare;
