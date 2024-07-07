#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const { argv } = yargs(hideBin(process.argv));
const nocoToken = process.env.NOCO_TOKEN;

if (!nocoToken) {
  console.error("The NOCO_TOKEN environment variable is missing or empty");
  process.exit(1);
}
if (0 === argv._.length) {
  console.error('No query parammeter added');
  process.exit(1);
}

const accountsQueryUrl = (query) => {
  return `https://noco.keokee.com/api/v2/tables/md_pl3sr1rtjqsgay/records?offset=0&limit=100&where=(Hosting%20Clients%2Clike%2C%25${query}%25)&viewId=vw_pxoltlm6jdqya6`;
};
const websitesQueryUrl = (query) => {
  return `https://noco.keokee.com/api/v2/tables/md_6o8hnu4g5grkd8/records?offset=0&limit=100&where=(Client%20Name%2Clike%2C%25${query}%25)&viewId=vw_9iah3ysaucva77`;
};
const websiteUrl = (clientId) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_6o8hnu4g5grkd8?rowId=${clientId}`;
};
const accountUrl = (clientId) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_pl3sr1rtjqsgay?rowId=${clientId}`;
};
const queryNoco = async (token, url) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "xc-token": token,
    },
  });
  if (200 !== res.status) {
    console.error("Could not fetch data");
    return;
  }
  const data = await res.json();
  return data;
};

const { list: accounts } = await queryNoco(nocoToken, accountsQueryUrl(argv._.join('%25')));
const res = accounts.map((acct) => {
  return {
    client: acct["Hosting Clients"][0]["Client Name"],
    username: acct.Username,
    password: acct.Password,
    accountUrl: accountUrl(acct.ncRecordId),
    clientUrl: websiteUrl(acct["Hosting Clients"][0].ncRecordId),
  };
});
console.dir(res);
