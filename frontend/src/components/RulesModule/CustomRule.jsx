import React, { useState } from "react";
import { BackgroundBox, StyledUl, StyledInput, StyledLi, ChipCancelButton, Container, SubmitButton, DashedLine } from "./styles";

const CustomRule = (props) => {
  const [name, setName] = useState("");
  const [params, setParams] = useState([""]);

  const renderParameters = () =>
    params.map((e, index) => (
      <StyledUl
        className="custom-rule-parameter"
        id="custom_rule_parameter"
        key={e}
        style={{ width: "100%", backgroundColor: "transparent" }}
      >
        <StyledInput
          placeholder="Name"
          name="param"
          type="text"
          value={e}
          onChange={(event) => {
            const data = [...params];
            data[index] = event.target.value.replace(" ", "");
            setParams(data);
          }}
        />
        <SubmitButton
          style={{
            margin: 10,
            width: 80,
            alignSelf: "flex-end",
            backgroundColor: "rgb(250, 70, 70)",
          }}
          type="submit"
          onClick={() => {
            const data = [...params];
            const index = data.indexOf(e);
            data.splice(index, 1);
            setParams(data);
          }}
        >
          <span>Remove</span>
        </SubmitButton>
      </StyledUl>
    ));

  const isValidForm = () => {
    if (name.length === 0) return false;
    return true;
  };

  return (
    <BackgroundBox
      style={{
        ...props.style,
        backgroundColor: "rgb(240,240,240)",
        margin: "10px 0px 10px 0px",
      }}
    >
      <StyledUl
        className="custom-rule"
        id="custom_rule"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          backgroundColor: "transparent",
          margin: 10,
        }}
      >
        <ChipCancelButton
          style={{ alignSelf: "flex-end" }}
          onClick={() => {
            props.cancelCallback();
          }}
        >
          ×
        </ChipCancelButton>
        <Container>Module</Container>
        <StyledInput
          className="custom-rule-name"
          id="custom_rule_name"
          placeholder="Name"
          name="module"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value.replace(" ", ""));
          }}
        />
        <DashedLine />
        <Container>Parameters</Container>
        {renderParameters()}
        <StyledLi
          className="custom-rule-add-new-param"
          id="custom_rule_add_new_param"
          style={{
            margin: 10,
            alignSelf: "flex-end",
            color: "#2173FF",
            textDecorationLine: "underline",
          }}
          type="submit"
          onClick={() => {
            setParams([...params, ""]);
          }}
        >
          + Add New
        </StyledLi>
        <SubmitButton
          className="custom-rule-submit-button"
          id="custom_rule_submit_button"
          disabled={!isValidForm()}
          style={{ margin: 10, width: "90%", backgroundColor: isValidForm() ? "#2173FF" : "lightgrey" }}
          type="submit"
          onClick={() => {
            props.submitCallback({ title: name, items: params.filter((p) => p.length > 0) });
          }}
        >
          <span>Submit</span>
        </SubmitButton>
      </StyledUl>
    </BackgroundBox>
  );
};

export default CustomRule;
