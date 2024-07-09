#!/usr/bin/env node

import { Command, Argument } from "commander";
import noco from "./lib/noco.js";

const program = new Command();
program
  .command("noco")
  .description("Query the noco database")
  // .argument("<table>", "One of 'accounts' or 'websites'")
  .addArgument(
    new Argument("<table>", "Table to query").choices(["accounts", "websites"]),
  )
  .argument("<query...>", "The string to query. PE `rust construction`")
  .action((table, query) => {
    (async () => {
      await noco(table, query);
    })();
  });

program.parse(process.argv);
