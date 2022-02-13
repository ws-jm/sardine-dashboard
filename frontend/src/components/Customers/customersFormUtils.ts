import { BlockAllowlistData } from "sardine-dashboard-typescript-definitions";

const convertType = (value: string) => {
  switch (value) {
    case "email_address":
      return "email";
    case "customer_id":
      return "user_id";

    default:
      return value;
  }
};

export const convertFieldsToBlockAllowList = (selectedFields: [string, string][]): BlockAllowlistData[] => {
  const list: BlockAllowlistData[] = [];
  selectedFields.forEach((field) => {
    if (field[1].includes(", ")) {
      field[1].split(", ").forEach((subfield) => {
        list.push({
          type: convertType(field[0]),
          value: subfield,
        });
      });
    } else {
      list.push({
        type: convertType(field[0]),
        value: field[1],
      });
    }
  });
  return list;
};
