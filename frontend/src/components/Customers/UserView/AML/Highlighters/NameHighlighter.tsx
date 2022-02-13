import { Highlighter } from "components/Highlighter";
import { CustomersResponse } from "sardine-dashboard-typescript-definitions";

export const extractNameWords = (customerData?: CustomersResponse) =>
  [customerData?.first_name, customerData?.last_name].filter((n) => n) as string[];

interface HighlightNameProps {
  value: string;
  customerData?: CustomersResponse;
}

export const NameHighlighter = ({ value, customerData }: HighlightNameProps): JSX.Element => {
  const nameWords = extractNameWords(customerData);

  return <Highlighter searchWords={nameWords} textToHighlight={value} />;
};
