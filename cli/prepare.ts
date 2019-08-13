import fs from "fs";
import path from "path";

export const DEFAULT_PREPARE_DIR = "prepared";

interface PrepareOptions {
  outDir: string;
}

/**
 * Resolve absolute path to directory.
 * Uses `process.cwd()` as root for relative directory.
 * @param directory
 */
const resolveDirectory = (directory: string) => {
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
    if (!fs.statSync(directory).isDirectory()) {
      throw Error(`Directory ${directory} exists but is not a directory`);
    }
    console.log(`Directory exists: ${directory}`);
    return;
  }

  // fs.accessSync(directory, fs.constants.R_OK && fs.constants.W_OK);
  console.log(`Creating directory: ${directory}`);
  fs.mkdirSync(directory);
  fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK);
};

/**
 *
 * @param service Service name, used as target directory in target base
 * @param targetBaseDirectory Relative or absolute path to where output should be written
 */
const ensureTargetDirectory = (
  service: string,
  targetBaseDirectory: string
) => {
  const resolvedDirectory = resolveDirectory(targetBaseDirectory);

  console.log(`Resolved directory: ${resolvedDirectory}`);

  ensureDirectory(resolvedDirectory);

  const resolveServiceDirectory = path.resolve(resolvedDirectory, service);

  ensureDirectory(resolveServiceDirectory);

  return resolveServiceDirectory;
};

const prepare = (service: string, opts: Partial<PrepareOptions>) => {
  const targetBaseDirectory = (opts && opts.outDir) || DEFAULT_PREPARE_DIR;
  console.log(
    `Preparing service "${service}", outputDirectory: ${JSON.stringify(
      targetBaseDirectory
    )}`
  );
  const targetDirectory = ensureTargetDirectory(service, targetBaseDirectory);
  console.log(`Prepared target: ${targetDirectory}`);
};

export default prepare;
