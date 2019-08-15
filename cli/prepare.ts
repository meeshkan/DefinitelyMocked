import chalk from "chalk";
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
import { IO, io } from "fp-ts/lib/IO";
import { array } from "fp-ts/lib/Array";

export const DEFAULT_SERVICE_DIR = "services";
export const DEFAULT_PREPARE_DIR = "prepared";

const color = (firstArg: any, ...args: any[]) =>
  chalk.bold.magenta(format(firstArg, ...args));

interface PrepareOptions {
  outBaseDir: string;
  servicesDir: string;
}

const existsDir = (directory: string) => {
  return fs.existsSync(directory) && fs.statSync(directory).isDirectory();
};

/**
 * TODO Do not hard-code services to live in `__dirname/../services`
 * @param service Service name, the name of the folder where to read service specification.
 */
const resolveServiceDefinitionDirectory = (service: string) => {
  const servicesDir = path.resolve(__dirname, "..", "services");
  return path.resolve(servicesDir, service);
};

const prepareMain = (service: string, opts: Partial<PrepareOptions>) => {
  const { targetDirectory, ops } = prepare(service, opts);
  // console.log(`Writing files to: ${color(targetDirectory)}`);
  ops();
  console.log(`Prepared package in: ${color(targetDirectory)}`);
};

const resolveOptions = (opts: Partial<PrepareOptions>): PrepareOptions => {
  const relativeServicesDir = opts.servicesDir || DEFAULT_SERVICE_DIR;
  const servicesDir = path.resolve(process.cwd(), relativeServicesDir);

  const relativeOutDir = (opts && opts.outBaseDir) || DEFAULT_PREPARE_DIR;

  const outBaseDir = path.resolve(process.cwd(), relativeOutDir);

  return { servicesDir, outBaseDir };
};

const prepare = (
  service: string,
  opts: Partial<PrepareOptions>
): { targetDirectory: string; ops: IO<any[]> } => {
  /**
   * Resolve where to read files
   */

  const { servicesDir, outBaseDir } = resolveOptions(opts);

  const serviceDefinitionDirectory = path.resolve(servicesDir, service);

  console.log(`Reading from: ${color(serviceDefinitionDirectory)}`);

  if (!existsDir(serviceDefinitionDirectory)) {
    throw Error(`Could not find directory: ${serviceDefinitionDirectory}`);
  }

  /**
   * Resolve where to write files
   */

  const resolvedTargetBase = outBaseDir;

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

  return {
    targetDirectory,
    ops: array.sequence(io)([
      createTargetDirectory,
      copyFilesOp,
      writePackageJsonOp,
      writeReadmeOp,
    ]),
  };
};

export default prepareMain;
