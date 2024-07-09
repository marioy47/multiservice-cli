/**
 * @param {Array<string>} query to be sent to noco for quering
 * @param {Object} options  Additional parammeters
 * @param {string} options.format One of `table` or `json` (json if none specified)
 * @returns {void}
 */
const cloudflare = async (query, { format }) => {
  const token = getCloudflareTokenOrExit();
  const values = await queryZones(token, query);

  // Print the data en the specified format.
  switch (format?.trim().toLowerCase()) {
    case "table":
      console.table(values); // TODO: enable the selection of fields https://developer.mozilla.org/en-US/docs/Web/API/console/table_static#restricting_the_columns_displayed
      break;
    default:
      console.log(JSON.stringify(values, null, 4));
  }
};

const getCloudflareTokenOrExit = () => {
  const token = process.env.CF_API_KEY;
  if (!token) {
    console.error("The CF_API_KEY environment variable is missing or empty");
    process.exit(1);
  }
  return token;
}

const queryZones = async (token, query) => {
  console.error(`Quering Cloudflare for  ${query.join(" ")}`);
  const { result: data } = await fetchCloudflareData(
    token,
    zonesQueryUrl(query.join("%25")),
  );
  return data.map((item) => ({
    name: item.name,
    originalRegistrar: item.original_registrar,
    account: item.account.name,
    id: item.id,
    clientUrl: cloudflareZoneUrl(item.name),
  }));
};

const fetchCloudflareData = async (token, url) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (200 !== res.status) {
    console.error("Could not fetch data");
    return;
  }
  const data = await res.json();
  return data;
};

const zonesQueryUrl = (query) => {
  return `https://api.cloudflare.com/client/v4/zones?name=contains:${query}`
};

const cloudflareZoneUrl = (clientId) => {
  return `https://dash.cloudflare.com/820aebacb8de1506ddd445529df1c997/${clientId}/dns/records`;
};

export default cloudflare;
