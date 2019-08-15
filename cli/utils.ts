import debug from "debug";
import fs from "fs";
import path from "path";
import { IO, io } from "fp-ts/lib/IO";
import { array } from "fp-ts/lib/Array";
import { some, none, Option, map, getOrElse } from "fp-ts/lib/Option";

const debugLog = debug("cli:utils");

const ioSequence = array.sequence(io);

export const copyFiles = ({
  source,
  targetDir,
  pattern,
}: {
  source: string;
  targetDir: string;
  pattern?: RegExp;
}): IO<void[]> => {
  const files = fs
    .readdirSync(source)
    .filter((filename: string) => (typeof pattern === "undefined" ? true : pattern.test(filename)));
  debugLog(`Preparing moving: ${JSON.stringify(files)}`);

  const copyOps: IO<void>[] = files.map((filename: string) => {
    const fullFilePath = path.resolve(source, filename);
    const fullTarget = path.resolve(targetDir, filename);
    return () => {
      debugLog(`Copying: ${fullFilePath} -> ${fullTarget}`);
      fs.copyFileSync(fullFilePath, fullTarget);
    };
  });

  return ioSequence(copyOps);
};

export const writeToFile = ({ contents, targetFile }: { contents: string | object; targetFile: string }): IO<void> => {
  debugLog(`Preparing write to ${targetFile}`);

  if (!path.isAbsolute(targetFile)) {
    throw Error(`Expected absolute path to target, got ${targetFile}`);
  }

  const prettyPrinted = typeof contents !== "string" ? JSON.stringify(contents, null, 2) : contents;

  return () => {
    debugLog(`Writing to ${targetFile}}`);
    fs.writeFileSync(targetFile, prettyPrinted);
  };
};

export const readPackageJson = (sourceDir: string): Option<PackageJson> => {
  const pathToFile = path.resolve(sourceDir, "package.json");

  if (!fs.existsSync(pathToFile)) {
    return none;
  }

  const fileContents = fs.readFileSync(pathToFile, "utf-8");
  const obj = JSON.parse(fileContents);
  return some(obj);
};

type PackageJson = Record<string, any>;

export const mergePackageJsons = ({ service, source }: { service: string; source: Option<PackageJson> }) => {
  const packageJsonOverride = (version?: string): PackageJson => ({
    name: `@unmock/${service}`,
    description: `Service specification for ${service}`,
    main: "",
    licence: "MIT",
    private: false,
    repository: {
      type: "git",
      url: "git+https://github.com/unmock/DefinitelyMocked.git",
      directory: `services/${service}`,
    },
    version: typeof version === "undefined" ? "1.0.0" : version,
  });

  const existingPackageJsonAugmented: Option<PackageJson> = map((packageJson: PackageJson) => ({
    ...packageJson,
    ...packageJsonOverride(packageJson.version),
  }))(source);

  return getOrElse(() => packageJsonOverride())(existingPackageJsonAugmented);
};

export const createPackageJson = ({ service, sourceDir }: { service: string; sourceDir: string }): PackageJson => {
  const existingPackageJson: Option<PackageJson> = readPackageJson(sourceDir);
  return mergePackageJsons({ service, source: existingPackageJson });
};

export const createReadme = ({ service }: { service: string }): string => {
  const readme = `
## Installation

\`\`\`bash
npm install @unmock/${service} --save-dev
yarn add @unmock/${service} -D 
\`\`\`

## Summary

This package contains the service definitions for ${service}.

## Details

Files were exported from https://github.com/unmock/DefinitelyMocked/tree/master/services/${service}.

`;
  return readme;
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

  debugLog(`Creating directory: ${directory}`);
  fs.mkdirSync(directory);
  fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK);
};

/**
 * Resolve target directory and ensure it exists.
 * @param service Service name, used as target directory in target base
 * @param targetBase Absolute path to where output should be written
 */
export const ensureTargetDirectory = ({
  targetBase,
  service,
}: {
  targetBase: string;
  service: string;
}): { targetServiceDirectory: string; createDirectoryOps: IO<void[]> } => {
  if (!path.isAbsolute(targetBase)) {
    throw Error(`Expected absolute path, got ${targetBase}`);
  }

  debugLog(`Target base directory: ${targetBase}`);

  const createBaseDirectoryOp: IO<void> = () => ensureDirectory(targetBase);

  // Resolve absolute path to target directory: "/path/to/base/service-name"
  const targetServiceDirectory = path.resolve(targetBase, service);

  const createTargetDirectoryOp: IO<void> = () => ensureDirectory(targetServiceDirectory);

  return {
    targetServiceDirectory,
    createDirectoryOps: ioSequence([createBaseDirectoryOp, createTargetDirectoryOp]),
  };
};
