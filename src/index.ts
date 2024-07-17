#!/usr/bin/env node
 
import { Command, Argument, Option } from "commander";
import noco from "./noco.js";
import cloudflare from "./cloudflare.js";
import spinupwp from "./spinupwp.js";
import wpengine from "./wpengine.js";

const program = new Command();

// Register the command for NOCO operations
program
  .command("noco")
  .alias("nc")
  .description("Query the noco database for account or website information")
  .addOption(
    new Option("--format <format>", "Output format in the console").choices([
      "json",
      "table",
    ]),
  )
  .addArgument(
    new Argument("<table>", "Table to query").choices(["accounts", "acct", "websites", "sites"]),
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
    new Option(
      "--format <format>",
      "How do you want to display the results",
    ).choices(["json", "table"]),
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

program
  .command("spinupwp")
  .alias("spinup")
  .alias("spwp")
  .alias("sp")
  .description("Searches servers and domains in SpinupWP")
  .addOption(
    new Option(
      "--format <format>",
      "How do you want to display the results",
    ).choices(["json", "table"]),
  )
  .addArgument(
    new Argument("type", "Type of action or request to do in Spinup").choices([
      "servers",
      "sites",
    ]),
  )
  .action((type,format) => {
    spinupwp(type, format);
  });

program
  .command("wpengine")
.description("Searches for installs in WP Engine")
.addOption(
    new Option("--format <format>", "Output format").choices(["json", "table"])
  )
.addArgument(
    new Argument('type', 'What to query in WPEngine').choices(['installs'])
  )
.argument("[...query]", "Account to find")
.action((type, query, format) => {
    wpengine(type, format, query);
  });

program.parse(process.argv);
