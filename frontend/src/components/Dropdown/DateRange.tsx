import React from "react";
import DatePicker from "react-datepicker";

const DateRange = ({
  date,
  onChange,
}: {
  date: { startDate: Date | null; endDate: Date | null };
  onChange: (arg: { startDate: Date | null; endDate: Date | null }) => void;
}): JSX.Element => {
  const { startDate, endDate } = date;

  const handleDateChange = (dates: Date | [Date | null, Date | null] | null) => {
    if (Array.isArray(dates)) {
      onChange({ startDate: dates[0], endDate: dates[1] });
    }
  };

  return (
    <DatePicker selected={startDate} onChange={handleDateChange} startDate={startDate} endDate={endDate} selectsRange inline />
  );
};

export default DateRange;
