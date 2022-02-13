import { Highlighter } from "components/Highlighter";
import { ListItem } from "./styles";
import { HighlighterProps } from "../types";

export const extractDob = (dob: string) => {
  if (!dob) return {};

  const dateParts = dob.match(/\d+/g);
  const containFullDate = dateParts?.length === 3;

  if (containFullDate) {
    // 2021-12-27
    return {
      day: dateParts[2],
      month: dateParts[1],
      year: dateParts[0],
    };
  }

  const containMonthYear = dateParts?.length === 2;
  if (containMonthYear) {
    // 2021-12
    return {
      month: dateParts[1],
      year: dateParts[0],
    };
  }

  return {
    year: dob,
  };
};

export const DobHighlighter = ({ value, customerData }: HighlighterProps<string>): JSX.Element => {
  if (!customerData?.date_of_birth) {
    return <>{value}</>;
  }

  const { day, month, year } = extractDob(value);
  const { day: searchDayWord, month: searchMonthWord, year: searchYearWord } = extractDob(customerData?.date_of_birth || "");

  const renderItems = [];

  if (year) {
    renderItems.push(
      <ListItem key={`year_${year}`}>
        <Highlighter searchWords={[searchYearWord]} textToHighlight={year} />
      </ListItem>
    );
  }

  if (month) {
    renderItems.push(
      <ListItem key={`month_${month}`}>
        <Highlighter searchWords={[searchMonthWord]} textToHighlight={month} />
      </ListItem>
    );
  }

  if (day) {
    renderItems.push(
      <ListItem key={`day_${day}`}>
        <Highlighter searchWords={[searchDayWord]} textToHighlight={day} />
      </ListItem>
    );
  }

  return <>{renderItems}</>;
};
