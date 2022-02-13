import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import moment, { Moment } from "moment";
import { replaceAllSpacesWithUnderscores } from "utils/stringUtils";
import DropwdownItem from "./DropdownItem";
import DropdownButton from "./DropdownButton";
import DateRange from "./DateRange";
import { DatesProps } from "../../utils/store/interface";
import { DATE_FORMATS } from "../../constants";

interface ChartDropdownElement {
  icon: string;
  field: number;
  option: string;
}

const iconPath = "../../utils/logo/chartsOnly.svg";
const CHARTS_DROPDOWN: readonly ChartDropdownElement[] = [
  {
    icon: iconPath,
    field: 1,
    option: "Last 24 hours",
  },
  {
    icon: iconPath,
    field: 7,
    option: "Last 7 days",
  },
  {
    icon: iconPath,
    field: 30,
    option: "Last 1 Month",
  },
  {
    icon: iconPath,
    field: 60,
    option: "Last 2 Months",
  },
  {
    icon: iconPath,
    field: 90,
    option: "Last 3 Months",
  },
  {
    icon: iconPath,
    field: 180,
    option: "Last 6 Months",
  },
  {
    icon: iconPath,
    field: 365,
    option: "Last 1 Year",
  },
  {
    icon: iconPath,
    field: 0,
    option: "Custom dates",
  },
] as const;

const StyledDropdownDiv = styled.div`
  z-index: 10;
  height: 36px;
  margin-left: 20px;
  max-width: 211px;
`;

const StyledDropdownList = styled.div`
  padding: 8px;
  background: #ffffff;
  z-index: 12;
  top: 0;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.02);
`;

const INDEX_24_HOURS = 0;
const INDEX_7_DAYS = 1;
const INDEX_1_MONTH = 2;
const INDEX_2_MONTHS = 3;
const INDEX_3_MONTHS = 4;
const INDEX_6_MONTHS = 5;
const INDEX_1_YEAR = 6;
const INDEX_CUSTOM_DATES = 7;

// Calculate dateIndex based on the startDate and endDate.
function getDateIndex(startDate?: Date, endDate?: Date) {
  const startDateMoment = moment.utc(startDate, DATE_FORMATS.DATETIME);
  const endDateMoment = moment.utc(endDate, DATE_FORMATS.DATETIME);
  const currentDate = moment.utc();
  const duration = moment.duration(currentDate.diff(endDateMoment));
  if (Math.round(duration.asHours()) === 0) {
    const startEndDuration = moment.duration(endDateMoment.diff(startDateMoment));
    const difference = Math.round(startEndDuration.asDays());

    switch (difference) {
      case 1:
        return INDEX_24_HOURS;
      case 7:
        return INDEX_7_DAYS;
      case 30:
        return INDEX_1_MONTH;
      case 60:
        return INDEX_2_MONTHS;
      case 90:
        return INDEX_3_MONTHS;
      case 180:
        return INDEX_6_MONTHS;
      case 365:
        return INDEX_1_YEAR;
      default:
        return INDEX_CUSTOM_DATES;
    }
  }
  return INDEX_CUSTOM_DATES;
}

const DaysDropdown = (props: {
  startDateString?: string;
  endDateString?: string;
  handleUpdateDate: (index: number, dateData: DatesProps) => void;
}): JSX.Element => {
  const daysDropdownRef = useRef<HTMLDivElement>(null);
  const { handleUpdateDate } = props;
  const { startDateString, endDateString } = props;
  let startDate: Date | null;
  let endDate: Date | null;
  if (startDateString === undefined) {
    startDate = moment().utc().subtract({ hours: 24 }).toDate();
  } else {
    startDate = moment.utc(startDateString).toDate();
  }
  if (endDateString === undefined) {
    endDate = moment().utc().toDate();
  } else {
    endDate = moment.utc(endDateString).toDate();
  }

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(getDateIndex(startDate, endDate));
  const [date, setDate] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate, endDate });

  const handleClick = (e: MouseEvent) => {
    if (!(daysDropdownRef && daysDropdownRef.current && daysDropdownRef.current.contains(e.target as Node))) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const updateDate = (index: number, startMoment: Moment, endMoment: Moment) => {
    handleUpdateDate(index, {
      startDate: startMoment.utc().format(DATE_FORMATS.DATETIME),
      endDate: endMoment.utc().format(DATE_FORMATS.DATETIME),
      selectedDateIndex: getDateIndex(startMoment.toDate(), endMoment.toDate()),
    });
  };

  const handleChangeCustomRange = (arg: { startDate: Date | null; endDate: Date | null }) => {
    const { startDate: start, endDate: end } = arg;
    setDate({
      startDate: start,
      endDate: end,
    });
    updateDate(INDEX_CUSTOM_DATES, moment(start), moment(end || start).endOf("day"));
  };

  const clickedItem = (days: number, index: number) => {
    setSelectedIndex(index);
    if (index !== INDEX_CUSTOM_DATES) {
      updateDate(index, moment().subtract({ days }), moment());
      setOpen(false);
    }
  };

  return open ? (
    <StyledDropdownDiv ref={daysDropdownRef}>
      <StyledDropdownList>
        {CHARTS_DROPDOWN.map((ele, index) => (
          <DropwdownItem
            clicked={() => clickedItem(ele.field, index)}
            key={ele.option}
            item={ele}
            isSelected={index === selectedIndex}
            id={`dropdown_item_days_${replaceAllSpacesWithUnderscores(ele.option)}`}
          />
        ))}
        {selectedIndex === INDEX_CUSTOM_DATES && (
          <DateRange date={{ startDate: date.startDate, endDate: date.endDate }} onChange={handleChangeCustomRange} />
        )}
      </StyledDropdownList>
    </StyledDropdownDiv>
  ) : (
    <DropdownButton
      id="dropdown_button_days"
      clicked={() => setOpen(true)}
      item={
        selectedIndex === INDEX_CUSTOM_DATES
          ? {
              icon: "../../utils/logo/chartsAndNumbers.svg",
              field: 0,
              option:
                date && date.startDate
                  ? `${date.startDate} - ${date.endDate || moment(date.startDate).endOf("day").toDate()}`
                  : "Custom Date",
            }
          : CHARTS_DROPDOWN[selectedIndex]
      }
    />
  );
};

export default DaysDropdown;
