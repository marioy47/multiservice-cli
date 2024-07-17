/**
 * @param {string} table The table name to query.
 * @param {Array<string>} query to be sent to noco for quering
 * @param {Object} options  Additional parammeters
 * @param {string} options.format One of `table` or `json` (json if none specified)
 * @returns {void}
 */
const noco = async (
  table: string,
  query: Array<string>,
  { format }: { [key: string]: string },
): Promise<void> => {
  const token = getNocoTokenOrExit();
  let values = [];
  let columns = ["client"];

  // Query the selected table.
  switch (table.trim().toLowerCase()) {
    case "accounts":
    case "acct":
      values = await queryAccountsTable(token, query);
      columns.push("username", "password");
      break;
    case "websites":
    case "sites":
      values = await queryWebsitesTable(token, query);
      columns.push("webAddress", "hosting");
      break;
    default:
  }

  // Print the data en the specified format.
  switch (format?.trim().toLowerCase()) {
    case "table":
      console.table(values, columns);
      break;
    default:
      console.log(JSON.stringify(values, null, 4));
  }
};
const getNocoTokenOrExit = () => {
  const token = process.env.NOCO_TOKEN;
  if (!token) {
    console.error("The NOCO_TOKEN environment variable is missing or empty");
    process.exit(1);
  }
  return token;
};
const accountsUrlTemplate = (query: string) => {
  return `https://noco.keokee.com/api/v2/tables/md_pl3sr1rtjqsgay/records?offset=0&limit=100&where=(Hosting%20Clients%2Clike%2C%25${query}%25)&viewId=vw_pxoltlm6jdqya6`;
};
const websitesUrlTemplate = (query: string) => {
  return `https://noco.keokee.com/api/v2/tables/md_6o8hnu4g5grkd8/records?offset=0&limit=100&where=(Client%20Name%2Clike%2C%25${query}%25)&viewId=vw_9iah3ysaucva77`;
};
const nocoWebsiteUrlFor = (clientId: string) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_6o8hnu4g5grkd8?rowId=${clientId}`;
};
const nocoAccountUrlFor = (clientId: string) => {
  return `https://noco.keokee.com/dashboard/#/nc/p_sapep8llkzqyfl/md_pl3sr1rtjqsgay?rowId=${clientId}`;
};
const fetchNocoData = async (token: string, url: string) => {
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
const queryAccountsTable = async (nocoToken: string, query: Array<string>) => {
  console.error(`Quering the database for ${query.join(" ")} account`);
  const { list: accounts } = await fetchNocoData(
    nocoToken,
    accountsUrlTemplate(query.join("%25")),
  );
  // TODO Create an Interface for NOCO results
  return accounts.map((acct: any) => ({
    client: acct["Hosting Clients"][0]["Client Name"],
    username: acct.Username,
    password: acct.Password,
    accountUrl: nocoAccountUrlFor(acct.ncRecordId),
    clientUrl: nocoWebsiteUrlFor(acct["Hosting Clients"][0].ncRecordId),
  }));
};
const queryWebsitesTable = async (nocoToken: string, query: Array<string>) => {
  console.error(`Quering the databasen for ${query.join(" ")} website`);
  const { list: websites } = await fetchNocoData(
    nocoToken,
    websitesUrlTemplate(query.join("%25")),
  );
  // TODO Create an Interface for NOCO results
  return websites.map((site: any) => ({
    client: site["Client Name"],
    webAddress: `https://${site["Web Address"].trim('https://')}`,
    hosting: site["Hosting Provider"],
    notes: site["Additional Notes"],
    clientUrl: nocoWebsiteUrlFor(site.ncRecordId),
  }));
};

export default noco;