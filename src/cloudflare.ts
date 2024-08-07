/**
 * @param {string} type Which action to perform
 * @param {Array<string>} query to be sent to noco for quering
 * @param {Object} options  Additional parammeters
 * @param {string} options.format One of `table` or `json` (json if none specified)
 * @returns {void}
 */
const cloudflare = async (
  type: string,
  query: Array<string>,
  { format }: { [key: string]: string },
): Promise<void> => {
  const token = getCloudflareTokenOrExit();

  let values = [];
  switch (type?.toLowerCase().trim()) {
    case "records":
      values = await queryRecords(token, query);
      break;
    default:
      values = await queryZones(token, query);
      break;
  }

  // Print the data en the specified format.
  switch (format?.trim().toLowerCase()) {
    case "json":
      console.log(JSON.stringify(values, null, 4));
      break;
    default:
      console.table(values); // TODO: enable the selection of fields https://developer.mozilla.org/en-US/docs/Web/API/console/table_static#restricting_the_columns_displayed
      break;
  }
};

const getCloudflareTokenOrExit = () => {
  const token = process.env.CF_API_KEY;
  if (!token) {
    console.error("The CF_API_KEY environment variable is missing or empty");
    process.exit(1);
  }
  return token;
};

const queryZones = async (token: string, query: Array<string>) => {
  console.error(`Quering Cloudflare for ${query.join(" ")}`);
  const { result: data } = await fetchCloudflareData(
    token,
    zonesQueryUrl(query.join("%25")),
  );
  // TODO: Crete interface for CF response.
  return data.map((item:any) => ({
    name: item.name,
    originalRegistrar: item.original_registrar,
    account: item.account.name,
    id: item.id,
    clientUrl: cloudflareZoneUrl(item.name),
  }));
};

const queryRecords = async (token: string, [query]: Array<string>) => {
  console.error(`Getting records for ${query}`);
  const [zones] = await queryZones(token, [query]);
  if (undefined === zones) return [];
  const { result: data } = await fetchCloudflareData(
    token,
    dnsRecordsUrl(zones.id),
  );
  // TODO Create interface for this response
  return data.map((item: any) => ({
    type: item.type,
    name: item.name,
    value: item.content.substring(0, 50),
    proxied: item.proxied,
    comment: item.comment?.substring(0, 20),
    date: item.modified_on,
  }));
};

const fetchCloudflareData = async (token:string, url:string) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (200 !== res.status) {
    console.error("Could not fetch data");
    return;
  }
  const data = await res.json();
  return data;
};

const zonesQueryUrl = (query:string) => {
  return `https://api.cloudflare.com/client/v4/zones?name=contains:${query}`;
};

const dnsRecordsUrl = (zoneId:string) => {
  return `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=200`;
};

const cloudflareZoneUrl = (clientId:string) => {
  return `https://dash.cloudflare.com/820aebacb8de1506ddd445529df1c997/${clientId}/dns/records`;
};

export default cloudflare;
