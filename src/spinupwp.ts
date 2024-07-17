// TODO: Remove all the 'any' types in favor of interfaces.

const spinupwp = async (
  type: string,
  { format }: { [k: string]: string },
): Promise<void> => {
  const token = getEnvTokenOrExit();
  let values: Object[] = [];

  switch (type.trim().toLowerCase()) {
    case "servers":
      values = await getServerData(token);
      break;
    case "sites":
      values = await getSitesData(token);
      break;
  }
  switch(format?.trim().toLowerCase()) {
    case "json":
      console.log(JSON.stringify(values, null, 4));
      break;
    case "table":
    default: 
      console.table(values);
      break;
  }
};

const getEnvTokenOrExit = (): string => {
  const token = process.env.SPINUP_WP_TOKEN;
  if (!token) {
    console.error(
      "You have to define the environment varialbe SPINUP_WP_TOKEN",
    );
    process.exit(1);
  }
  return token;
};

const getServerData = async (token: string) => {
  const { data } = await fetchSpinupData(
    token,
    "https://api.spinupwp.app/v1/servers?limit=100",
  );

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    ip: item.ip_address,
    rebootReq: item.reboot_required,
    dash: `https://spinupwp.app/keokee/servers/${item.id}`,
  }));
};

const fetchSpinupData = async (token: string, url: string) => {
  const data = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await data.json();
};

const getSitesData = async (token: string) => {
  const servers = await getServerData(token);
  const dashboardUrls: { [key: string]: [string, string] } = {};
  const ids = servers.map((item: any) => {
    dashboardUrls[item.id] = [
      `https://spinupwp.app/keokee/servers/${item.id}`,
      item.name,
    ];
    return fetchSpinupData(
      token,
      `https://api.spinupwp.app/v1/sites?limit=100&server_id=${item.id}`,
    );
  });
  const allServers = await Promise.all(ids);
  const allSites: Object[] = [];
  allServers.forEach(({ data }) => {
    const sites = data.map((item: any) => ({
      id: item.id,
      domain: item.domain,
      server: dashboardUrls[item.server_id][1],
      user: item.site_user,
      serverDash: dashboardUrls[item.server_id][0],
      siteDash: `https://spinupwp.app/keokee/sites/${item.id}`,
    }));
    allSites.push(...sites);
  });
  return allSites;
};

export default spinupwp;
