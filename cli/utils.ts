import debug from "debug";
import fs from "fs";
import path from "path";
import { IO, io } from "fp-ts/lib/IO";
import { array } from "fp-ts/lib/Array";
import { some, none, Option, map, getOrElse } from "fp-ts/lib/Option";

const debugLog = debug("cli:utils");

/*
Sequencing IOs:

// Using tuples
const ioSequence = sequenceT(io);
const sequenced = ioSequence(() => {}, () => {});

// Using arrays
const ios: IO<void>[] = [() => {}, () => {}];
const sequenceArray = array.sequence(io);
const sequenced = sequenceArray(ios);

*/

const ioSequence = array.sequence(io);

// TODO Rather return IOEither
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
    .filter((filename: string) =>
      typeof pattern === "undefined" ? true : pattern.test(filename)
    );
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

// TODO Rather return IOEither
export const writeToFile = ({
  object,
  targetFile,
}: {
  object: any;
  targetFile: string;
}): IO<void> => {
  debugLog(`Preparing write to ${targetFile}`);

  if (!path.isAbsolute(targetFile)) {
    throw Error(`Expected absolute path to target, got ${targetFile}`);
  }

  const prettyPrinted = JSON.stringify(object, null, 2);

  return () => {
    debugLog(`Writing to ${targetFile}}`);
    fs.writeFileSync(targetFile, prettyPrinted);
  };
};

/**
 * TODO Do not throw on failures.
 */
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

export const createPackageJson = ({
  service,
  sourceDir,
}: {
  service: string;
  sourceDir: string;
}): PackageJson => {
  const existingPackageJson: Option<PackageJson> = readPackageJson(sourceDir);

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

  const existingPackageJsonAugmented: Option<PackageJson> = map(
    (packageJson: PackageJson) => ({
      ...packageJson,
      ...packageJsonOverride(packageJson.version),
    })
  )(existingPackageJson);

  return getOrElse(() => packageJsonOverride())(existingPackageJsonAugmented);
};
