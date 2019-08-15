import debug from "debug";
import fs from "fs";
import path from "path";
import { IO, io } from "fp-ts/lib/IO";
import { array } from "fp-ts/lib/Array";

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
}): IO<void> => {
  const files = fs
    .readdirSync(source)
    .filter((filename: string) =>
      typeof pattern === "undefined" ? true : pattern.test(filename)
    );
  debugLog(`Moving files: ${JSON.stringify(files)}`);

  const copyOps: IO<void>[] = files.map((filename: string) => {
    const fullFilePath = path.resolve(source, filename);
    const fullTarget = path.resolve(targetDir, filename);
    return () => fs.copyFileSync(fullFilePath, fullTarget);
  });

  return ioSequence(copyOps);
};
