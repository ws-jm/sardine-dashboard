import { existsSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { getRulesData, CHECK_POINTS, DATA_TYPES, ItemModel, DataType } from "../utils/dataProviderUtils";

function toGoType(t: string) {
  switch (t as DataType) {
    case DATA_TYPES.int:
      return "int32";
    case DATA_TYPES.float:
      return "float32";
    case DATA_TYPES.bool:
      return "bool";
    case DATA_TYPES.string:
      return "string";
    case DATA_TYPES.stringarray:
      return "[]string";
    default:
      return "invalid"; // return invalid value so produced go code cannto be complied
  }
}

function toJsonTag(title: string) {
  let prefixSize = 1;
  if (title.startsWith("OS") || title.startsWith("ID")) {
    prefixSize = 2;
  } else if (title.startsWith("LTM")) {
    prefixSize = 3;
  }
  return `${title.substring(0, prefixSize).toLowerCase()}${title.substring(prefixSize)}`;
}

function toStructField(i: ItemModel) {
  if (i.title === "RiskLevel") {
    return `\tRiskLevel string`;
  }
  return `\t${i.title} ${toGoType(i.dataType)} \`json:"${toJsonTag(i.title)},omitempty"\` ${
    i.isHidden ? "// hidden in rule editor UI" : ""
  }`;
}

const deviceEnvs: { [key: string]: string } = {};
const customerEnvs: { [key: string]: string } = {};
const data = getRulesData(true, CHECK_POINTS.Customer, true);
data.forEach((r) => {
  if (r.items.length === 0) {
    console.log(`skipping ${r.title}...`);
    return;
  }
  const liveFeatures = r.items.filter((sr) => !sr.isDemo);
  if (liveFeatures.length === 0) {
    console.log(`${r.title} doesn't have any live feature, skipping`);
    return;
  }
  let env = `type ${r.title}Env struct{\n`;
  env += liveFeatures.map(toStructField).join("\n");
  env += "\n}\n";

  if (["Device", "Session", "Biometric"].includes(r.title)) {
    deviceEnvs[r.title] = env;
  } else {
    customerEnvs[r.title] = env;
  }
});

if (!existsSync("./generated")) {
  mkdirSync("./generated");
}

writeFileSync(
  "generated/features.go",
  `
  package api\n\n
  type DeviceRulesEnv struct {
    Env
    ${Object.keys(deviceEnvs)
      .map((e) => `${e} ${e}Env \`json:"${toJsonTag(e)},omitempty"\``)
      .join("\n")}
  }
  ${Object.values(deviceEnvs).join("\n")}\n\n
  type CustomerRulesEnv struct {
    Env
    DeviceRulesEnv
    ${Object.keys(customerEnvs)
      .map((e) => `${e} ${e}Env \`json:"${toJsonTag(e)},omitempty"\``)
      .join("\n")}
  }
  ${Object.values(customerEnvs).join("\n")}\n
`
);
execSync("gofmt -w generated/features.go");

console.log("file generated at generated/features.go");
