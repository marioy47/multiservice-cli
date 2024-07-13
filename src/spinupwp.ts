interface SpWpServerData {
  id: string;
  name: string;
  ip_address: string;
  reboot_required: string;
}
export default async (
  type: string,
  query: string[],
  { format }: { [key: string]: "table" | "json" },
): Promise<void> => {
  const token = getEnvTokenOrExit();
  let values = [];

  switch (type.trim().toLowerCase()) {
    case "servers":
      values = await getServerData(token);
      break;
  }
  console.table(values, ["name", "ip", "rebootReq", "dash"]);
  // switch (format?.trim().toLowerCase()) {
  //   case "table":
  //     console.table(values);
  //     break;
  //   default:
  //     console.log(values);
  //     break;
  // }
};

function getEnvTokenOrExit() {
  const token = process.env.SPINUP_WP_TOKEN;
  if (!token) {
    console.error(
      "You have to define the environment varialbe SPINUP_WP_TOKEN",
    );
    process.exit(1);
  }
  return token;
}

async function getServerData(token: string) {
  const { data } = await fetchSpinupWpData(
    token,
    "https://api.spinupwp.app/v1/servers?limit=100",
  );
  return data.map((item: { [key: string]: SpWpServerData }) => ({
    id: item.id,
    name: item.name,
    ip: item.ip_address,
    rebootReq: item.reboot_required,
    dash: `https://spinupwp.app/keokee/servers/${item.id}`,
  }));
}

async function fetchSpinupWpData(token: string, url: string) {
  const data = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await data.json();
}
