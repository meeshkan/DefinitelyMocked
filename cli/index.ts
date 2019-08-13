const program = require("commander");
import { prepare } from "./actions";

program
  .command("prepare <service>")
  .description("Prepare a service for publishing")
  // .option("-r, --recursive", "Remove recursively")
  .action((service: string) => prepare(service));

// error on unknown commands
program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  );
  process.exit(1);
});

program.parse(process.argv);
