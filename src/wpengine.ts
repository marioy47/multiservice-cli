const wpengine = async (
  type: string,
  { format }: { [k: string]: string },
  query: string,
) => {
  let values;

  switch (type.trim().toLowerCase()) {
    case "installs":
    default:
      values = await getInstalls(query);
      break;
  }

  switch (format?.toLowerCase().trim()) {
    case "json":
      console.log(JSON.stringify(values, null, 4));
      break;
    case "table":
    default:
      console.table(values);
      break;
  }
};

type InstallResults = {
  name: string;
  php: string;
  domain: string;
  url: string;
};

const getInstalls = async (query: string = "") => {
  const json = await queryWpApi(
    `https://api.wpengineapi.com/v1/installs?limit=200`,
  );
  const unsorted = json.results
  .filter((item:any) => item.name.includes(query))
  .map(
    (item: { [k: string]: string }): InstallResults => ({
      name: item.name,
      php: item.php_version,
      domain: item.primary_domain,
      url: `https://my.wpengine.com/installs/${item.name}`,
    }),
  );

  unsorted.sort((a: InstallResults, b: InstallResults) => {
    return a.name <= b.name ? -1 : 1;
  });
  return unsorted;
};

const queryWpApi = async (url: string): Promise<any> => {
  const auth = getBase64Auth();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  if (200 !== response.status) {
    console.error("Error while fetching the API data");
    process.exit(2);
  }
  return await response.json();
};

const getBase64Auth = (): string => {
  const [username, password] = getWpengineUserPassOrExit();
  return Buffer.from(`${username}:${password}`).toString("base64");
};

const getWpengineUserPassOrExit = (): [string, string] => {
  if (!process.env.WPENGINE_USER_ID) {
    console.error("The WPENGINE_USER_ID environment variable is not set");
    process.exit(1);
  }
  if (!process.env.WPENGINE_PASSWORD) {
    console.error("The WPENGINE_PASSWORD environment variable is not set");
    process.exit(1);
  }
  return [process.env.WPENGINE_USER_ID, process.env.WPENGINE_PASSWORD];
};

export default wpengine;
