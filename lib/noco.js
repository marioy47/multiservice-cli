/**
 * @param {string} table The table name to query.
 * @param {Array<string>} query to be sent to noco for quering
 * @returns {void}
 */
const noco = async (table, query) => {
  const nocoToken = process.env.NOCO_TOKEN;
  if (!nocoToken) {
    console.error("The NOCO_TOKEN environment variable is missing or empty");
    process.exit(1);
  }
  let values = [];
  switch (table.trim().toLowerCase()) {
    case "accounts":
      console.error(`Quering the database for ${query.join(" ")} account`);
      const { list: accounts } = await fetchNocoData(
        nocoToken,
        queryAccountsApi(query.join("%25")),
      );
      values = accounts.map((acct) => ({
        client: acct["Hosting Clients"][0]["Client Name"],
        username: acct.Username,
        password: acct.Password,
        accountUrl: nocoAccountUrlFor(acct.ncRecordId),
        clientUrl: nocoWebsiteUrlFor(acct["Hosting Clients"][0].ncRecordId),
      }));
      break;
    case "websites":
      console.error(`Quering the database for ${query.join(" ")} website`);
      const { list: websites } = await fetchNocoData(
        nocoToken,
        queryWebsitesApi(query.join("%25")),
      );
      values = websites.map((site) => ({
        client: site["Client Name"],
        webAddress: site["Web Address"],
        hosting: site["Hosting Provider"],
        notes: site["Additional Notes"],
      }));
      break;
    default:
  }
  console.log(JSON.stringify(values, null, 4));
};

const queryAccountsApi = (query) => {
  return `https://noco.keokee.com/api/v2/tables/md_pl3sr1rtjqsgay/records?offset=0&limit=100&where=(Hosting%20Clients%2Clike%2C%25${query}%25)&viewId=vw_pxoltlm6jdqya6`;
};
const queryWebsitesApi = (query) => {
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

export default noco;
