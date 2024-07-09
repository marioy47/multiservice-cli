#!/usr/bin/env node

import { Command, Argument, Option } from "commander";
import noco from "./lib/noco.js";
import cloudflare from "./lib/cloudflare.js";

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

program
  .command("cloudflare")
  .description("Query all managed zones in Cloudflare")
  .addOption(
    new Option("--format", "How do you want to results")
      .choices(["json", "table"])
  )
.argument("<query...>", "Part of the name of the zone. Pe `180closet`")
.action((query, format) => {
    cloudflare(query, format);
  })

program.parse(process.argv);
