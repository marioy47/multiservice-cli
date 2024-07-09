#!/usr/bin/env node

import { Command, Argument, Option } from "commander";
import noco from "./lib/noco.js";

const program = new Command();
program
  .command("noco")
  .description("Query the noco database")
  .addOption(
    new Option("--format <format>", "Output format in the console").choices([
      "json",
      "table",
    ]),
  )
  .addArgument(
    new Argument("<table>", "Table to query").choices(["accounts", "websites"]),
  )
  .argument("<query...>", "The string to query. PE `rust construction`")
  .action((table, query, format) => {
    (async () => {
      await noco(table, query, format);
    })();
  });

program.parse(process.argv);
