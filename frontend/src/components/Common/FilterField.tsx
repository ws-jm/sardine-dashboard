import React, { useState } from "react";
import styled from "styled-components";
import { InputGroup, FormControl, Dropdown, Button, Row, Col } from "react-bootstrap";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { replaceAll, replaceAllSpacesWithUnderscores } from "utils/stringUtils";
import { StyledDropdownDiv } from "../Dashboard/styles";
import DaysDropdown from "../Dropdown/DaysDropdown";
import { DatesProps } from "../../utils/store/interface";

const Container = styled.div`
  width: inherit;
`;

const InputGroupWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;

  @media (max-width: 480px) {
    display: block;
  }
`;

const ChipWrapper = styled.div`
  justify-content: flex-start;
  margin: 10px;
`;

const Line = styled.div`
  height: 1.5px;
  width: 100%;
  margin-bottom: 10px;
  background-color: rgb(240, 240, 240);
`;

const ChipContainer = styled.div`
  font-family: IBM Plex Sans;
  background-color: rgb(240, 240, 240);
  font-size: 14px;
  border-radius: 30px;
  height: 30px;
  padding: 0 4px 0 1rem;
  display: inline-flex;
  align-items: center;
  margin: 0 0.3rem 0.3rem 0;
`;

const ChipCancelButton = styled.li`
  background-color: #f8fbff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  font-weight: normal;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface FilterData {
  key: string;
  value: AnyTodo;
  apply: boolean;
  currently_applied: boolean;
}

interface IProps {
  ref?: AnyTodo;
  placeholder: string;
  fields: readonly string[];
  filters: FilterData[];
  dividerIndexes?: number[];
  dividerIndex?: number;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  startDate?: string;
  endDate?: string;
  updateDate?: (index: number, dateData: DatesProps) => void;
  onFiltersUpdate: (filters: Array<FilterData>) => void;
  onApply: () => void;
  enableDurationSearch?: boolean;
  className?: string;
}

const safeReplaceAll = (s: string | undefined, from: string, to: string) => {
  if (!s) {
    return "";
  }
  return replaceAll(s, from, to);
};

export function getFilters(pathSearch: string, filteredFields: readonly string[]): Array<FilterData> {
  const searchParams = new URLSearchParams(pathSearch);
  const dataFilters: Array<FilterData> = [];
  filteredFields.forEach((field) => {
    const value: string | null = searchParams.get(field);
    if (value !== null) {
      dataFilters.push({
        key: field,
        value,
        apply: true,
        currently_applied: true,
      });
    }
  });
  return dataFilters;
}

const ContentInChip = (filter: FilterData) => {
  const { key, value, apply } = filter;
  const content = `${safeReplaceAll(key, "_", " ")} : ${value} `;
  if (apply) {
    return content;
  }
  return <del>{content}</del>;
};

const newlyAppliedFilter = (filter: FilterData): boolean =>
  (!filter.currently_applied && filter.apply) || (filter.currently_applied && !filter.apply);

const ApplyButton = ({ filters, dateChanged, onApply }: { filters: FilterData[]; dateChanged: boolean; onApply: () => void }) => {
  if (filters.reduce((acc, val) => acc || newlyAppliedFilter(val), false) || dateChanged) {
    return (
      <Button
        style={{ marginLeft: "auto", backgroundColor: "#2173FF", borderRadius: "25px" }}
        onClick={onApply}
        data-tid="filter_field_apply_changes_button"
      >
        Apply Changes
      </Button>
    );
  }
  return null;
};

const Chips = ({
  onApply,
  onChipToggle,
  filters,
  dateChanged,
}: {
  onApply: () => void;
  onChipToggle: (index: number) => void;
  filters: FilterData[];
  dateChanged: boolean;
}) => {
  const chips = filters.map((val, index) => (
    <ChipContainer
      key={val.key}
      data-tid={`filter_field_chip_${val.key}`}
      style={{
        backgroundColor: newlyAppliedFilter(val) ? "#2173FF" : "",
        color: newlyAppliedFilter(val) ? "#FFFFFF" : "",
      }}
    >
      {ContentInChip(val)}
      <ChipCancelButton
        onClick={() => {
          onChipToggle(index);
        }}
        style={{
          color: "#000",
        }}
      >
        {val.apply ? "×" : "+"}
      </ChipCancelButton>{" "}
    </ChipContainer>
  ));

  return (
    <>
      {" "}
      <Line />
      <Row>
        <Col xs={10}>
          <ChipWrapper>
            {"Filters: "}
            {chips}
          </ChipWrapper>
        </Col>
        <Col xs={2} className="align-self-center">
          <ApplyButton onApply={onApply} filters={filters} dateChanged={dateChanged} />
        </Col>
      </Row>
      <Line />{" "}
    </>
  );
};

const FilterField = (p: IProps): JSX.Element => {
  const [text, setText] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [dateChanged, setDateChanged] = useState(false);

  const {
    startDate,
    endDate,
    updateDate,
    filters,
    onApply,
    onFiltersUpdate,
    dividerIndexes,
    dividerIndex,
    enableDurationSearch = true,
    className,
    fields,
    placeholder,
    ref,
    style,
    containerStyle,
  } = p;

  const onDateChange = (index: number, dateData: DatesProps) => {
    if (updateDate) {
      updateDate(index, dateData);
    }
    setDateChanged(true);
  };

  const onChipToggle = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { currently_applied } = filters[index];
    if (currently_applied) {
      const apply = !filters[index].apply;
      onFiltersUpdate([...filters.slice(0, index), { ...filters[index], apply }, ...filters.slice(index + 1)]);
    } else {
      onFiltersUpdate([...filters.slice(0, index), ...filters.slice(index + 1)]);
    }
  };

  const isValid = () => text.trim().length > 0 && selectedField.length > 0;

  const onAdd = (filter: FilterData) => {
    if (filter.key.length !== 0 && filter.value.length !== 0) {
      onFiltersUpdate([...filters, filter]);
    }
  };

  const addCallback = () => {
    onAdd({
      key: selectedField,
      value: text.trim(),
      apply: true,
      currently_applied: false,
    });
    setText("");
    setSelectedField("");
  };

  return (
    <Container className={className || ""} data-tid="filter_field" style={containerStyle}>
      <InputGroupWrapper>
        {enableDurationSearch && (
          <StyledDropdownDiv className="mb-3" style={{ flex: "None" }}>
            Duration:
            <DaysDropdown handleUpdateDate={onDateChange} startDateString={startDate} endDateString={endDate} />
          </StyledDropdownDiv>
        )}
        <InputGroup className="mb-3 search-btn" style={{ justifyContent: "flex-end", alignItems: "center", ...style }}>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              style={{ textTransform: "capitalize", color: "var(--dark-14)" }}
              data-tid="dropdown_button_filter_field"
            >
              {selectedField.length > 0 ? safeReplaceAll(selectedField, "_", " ") : "Select Column"}{" "}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {fields.map((f, ind) => (
                <span key={f}>
                  {dividerIndexes?.includes(ind) || dividerIndex === ind ? <Dropdown.Divider /> : null}
                  <Dropdown.Item
                    key={f}
                    style={{ textTransform: "capitalize" }}
                    onClick={() => {
                      setSelectedField(f);
                    }}
                    data-tid={`dropdown_item_select_column_${replaceAllSpacesWithUnderscores(f)}`}
                  >
                    {safeReplaceAll(f, "_", " ")}
                  </Dropdown.Item>
                </span>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <FormControl
            data-tid="filter_field_form_control"
            placeholder={placeholder}
            aria-label={placeholder}
            aria-describedby="basic-addon2"
            value={text}
            style={{ maxWidth: 400, minWidth: 200, height: "auto" }}
            onChange={(event) => {
              setText(event.target.value);
            }}
            ref={ref}
          />
          <InputGroup.Text
            id="basic-addon2"
            onClick={isValid() ? addCallback : () => {}}
            style={{
              backgroundColor: isValid() ? "#2173FF" : "#f7f7f7",
              color: isValid() ? "#FFFFFF" : "grey",
              width: 150,
              justifyContent: "center",
              height: "fit-content",
              cursor: isValid() ? "pointer" : "",
            }}
          >
            Add
          </InputGroup.Text>
        </InputGroup>
      </InputGroupWrapper>
      <Chips onApply={onApply} onChipToggle={onChipToggle} filters={filters} dateChanged={dateChanged} />
    </Container>
  );
};

export default FilterField;
