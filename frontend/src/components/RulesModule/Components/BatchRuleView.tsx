import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import RecursiveDropdown from "components/Common/RecursiveDropdown";
import { StyledUl, Title, HorizontalSpace, Container, Line } from "../styles";
import { BatchRuleData, BATCH_RULE_DURATIONS, DATA_TYPES, isWideScreen } from "../../../utils/dataProviderUtils";

interface BatchRuleViewProps {
  onDataChanged: (value: BatchRuleData | undefined) => void;
  data: BatchRuleData | undefined;
}

const BatchRuleView: React.FC<BatchRuleViewProps> = (props) => {
  const { data, onDataChanged } = props;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [duration, setDuration] = useState(data?.BatchDuration || "");
  const [count, setCount] = useState(data?.BatchCount || "");

  useEffect(() => {
    onDataChanged({
      BatchCount: count,
      BatchDuration: duration,
    });
  }, [duration, count]);

  return (
    <Container className="batch-rule-view" id="batch_rule_view">
      <StyledUl style={{ background: "transparent", justifyContent: "left", paddingLeft: 20 }}>
        <Form.Control
          className="batch-rule-view-number-of-hits"
          id="batch_rule_view_number_of_hits"
          style={{ width: isWideScreen() ? "20%" : "30%", height: 40 }}
          placeholder="Number of hits"
          name="count"
          type="number"
          value={count}
          onChange={(event) => setCount(event.target.value)}
          isInvalid={false}
        />
        <HorizontalSpace />
        <Title> in </Title>
        <HorizontalSpace />
        <RecursiveDropdown
          data={BATCH_RULE_DURATIONS.map((d) => ({
            datatype: DATA_TYPES.string,
            title: d,
            items: [],
          }))}
          onDropdownClicked={(visible) => {
            setDropdownVisible(!visible);
          }}
          onItemClicked={(value) => {
            setDuration(value);
            setDropdownVisible(false);
          }}
          value={duration}
          show={dropdownVisible}
        />
      </StyledUl>
      <Line style={{ marginBottom: 0 }} />
    </Container>
  );
};

export default BatchRuleView;
