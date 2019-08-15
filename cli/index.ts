#!/usr/bin/env node
const program = require("commander");
import prepare, { DEFAULT_PREPARE_DIR } from "./prepare";

if (process.argv.length < 3) {
  console.error("Missing command. See --help for a list of available commands.");
}

program
  .command("prepare <service>")
  .description("Prepare a service for publishing")
  .option("-o, --out-dir <dir>", `Output directory (default: ${DEFAULT_PREPARE_DIR})`)
  .option("-d, --service-dir <dir>", `Services directory where to look for folder <service> (default: ./services)`)
  .action((service: string, cmdObj: any) => {
    prepare(service, {
      outBaseDir: cmdObj.outDir,
      servicesDir: cmdObj.serviceDir,
    });
  });

// Error on unknown commands
program.on("command:*", function() {
  console.error("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
  process.exit(1);
});

program.parse(process.argv);
