const program = require("commander");
import prepare, { DEFAULT_PREPARE_DIR } from "./prepare";

if (process.argv.length < 3) {
  console.error(
    "Missing command. See --help for a list of available commands."
  );
}

program
  .command("prepare <service>")
  .description("Prepare a service for publishing")
  .option(
    "-o, --out-dir <dir>",
    `Output directory (default: ${DEFAULT_PREPARE_DIR})`
  )
  .action((service: string, cmdObj: any) => {
    prepare(service, { outDir: cmdObj.outDir });
  });

// Error on unknown commands
program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  );
  process.exit(1);
});

program.parse(process.argv);
