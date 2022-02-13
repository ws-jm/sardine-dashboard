import { writeFileSync, existsSync, mkdirSync } from "fs";
import { getRulesData, CHECK_POINTS, ItemModel } from "../utils/dataProviderUtils";

const escapeForCSV = (t: string | boolean) => `"${String(t).replace(/\"/g, '""')}"`;

const data = getRulesData(true, CHECK_POINTS.Customer, true);
let rulesData: ItemModel[] = [];
data.forEach((r) => {
  if (r.items.length > 0) {
    r.items.forEach((sr) => {
      sr.title = `${r.title}.${sr.title}`;
      rulesData = [...rulesData, sr];
    });
  } else {
    rulesData = [...rulesData, r];
  }
});

const out: string[] = [];
out.push(["category", "feature", "example", "description", "demo?"].join(","));
rulesData.forEach((r) => {
  if (r.title === "Jaro-Winkler distance") {
    return;
  }
  const row = [r.title.split(".")[0], r.title.split(".")[1], r.sample, r.description, r.isDemo];
  out.push(row.map(escapeForCSV).join(","));
});

if (!existsSync("./generated")) {
  mkdirSync("./generated");
}

writeFileSync("./generated/features.csv", out.join("\n"));
