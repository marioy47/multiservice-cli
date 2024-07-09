/**
 * @param {string} table The table name to query.
 * @param {Array<string>} query to be sent to noco for quering
 * @param {Object} options  Additional parammeters
 * @param {string} options.format One of `table` or `json` (json if none specified)
 * @returns {void}
 */
const noco = async (table, query, { format }) => {
  const token = getNocoTokenOrExit();
  let values = [];

  // Query the selected table.
  switch (table.trim().toLowerCase()) {
    case "accounts":
      values = await queryAccountsTable(token, query);
      break;
    case "websites":
      values = await queryWebsitesTable(token, query);
      break;
    default:
  }

  // Print the data en the specified format.
  switch (format?.trim().toLowerCase()) {
    case "table":
      console.table(values); // TODO: enable the selection of fields https://developer.mozilla.org/en-US/docs/Web/API/console/table_static#restricting_the_columns_displayed
      break;
    default:
      console.log(JSON.stringify(values, null, 4));
  }
};
const getNocoTokenOrExit = () => {
  const nocoToken = process.env.NOCO_TOKEN;
  if (!nocoToken) {
    console.error("The NOCO_TOKEN environment variable is missing or empty");
    process.exit(1);
  }
  return nocoToken;
}
const accountsUrlTemplate = (query) => {
  return `https://noco.keokee.com/api/v2/tables/md_pl3sr1rtjqsgay/records?offset=0&limit=100&where=(Hosting%20Clients%2Clike%2C%25${query}%25)&viewId=vw_pxoltlm6jdqya6`;
};
const websitesUrlTemplate = (query) => {
  return `https://noco.keokee.com/api/v2/tables/md_6o8hnu4g5grkd8/records?offset=0&limit=100&where=(Client%20Name%2Clike%2C%25${query}%25)&viewId=vw_9iah3ysaucva77`;
};
const nocoWebsiteUrlFor = (clientId) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_6o8hnu4g5grkd8?rowId=${clientId}`;
};
const nocoAccountUrlFor = (clientId) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_pl3sr1rtjqsgay?rowId=${clientId}`;
};
const fetchNocoData = async (token, url) => {
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
const queryAccountsTable = async (nocoToken, query) => {
  console.error(`Quering the database for ${query.join(" ")} account`);
  const { list: accounts } = await fetchNocoData(
    nocoToken,
    accountsUrlTemplate(query.join("%25")),
  );
  return accounts.map((acct) => ({
    client: acct["Hosting Clients"][0]["Client Name"],
    username: acct.Username,
    password: acct.Password,
    accountUrl: nocoAccountUrlFor(acct.ncRecordId),
    clientUrl: nocoWebsiteUrlFor(acct["Hosting Clients"][0].ncRecordId),
  }));
};
const queryWebsitesTable = async (nocoToken, query) => {
  console.error(`Quering the database for ${query.join(" ")} website`);
  const { list: websites } = await fetchNocoData(
    nocoToken,
    websitesUrlTemplate(query.join("%25")),
  );
  return websites.map((site) => ({
    client: site["Client Name"],
    webAddress: site["Web Address"],
    hosting: site["Hosting Provider"],
    notes: site["Additional Notes"],
    clientUrl: nocoWebsiteUrlFor(site.ncRecordId),
  }));
};

export default noco;
