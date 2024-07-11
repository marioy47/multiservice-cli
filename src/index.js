#!/usr/bin/env node

import { Command, Argument, Option } from "commander";
import noco from "./noco.js";
import cloudflare from "./cloudflare.js";

const program = new Command();
program
  .command("noco")
  .alias("nc")
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
    noco(table, query, format);
  });

program
  .command("cloudflare")
  .alias("cf")
  .description("Query Cloudflare for zones and records")
  .addOption(
    new Option("--format <format>", "How do you want to display the results").choices([
      "json",
      "table",
    ]),
  )
  .addArgument(
    new Argument("type", "Type of query/seawrch to perform").choices([
      "zones",
      "records",
    ]),
  )
  .argument("<query...>", "Part of the name of the zone. Pe `180closet`")
  .action((type, query, format) => {
    cloudflare(type, query, format);
  });

program.parse(process.argv);
