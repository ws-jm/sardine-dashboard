import React, { useState } from "react";
import { StyledUl, StyledInput, SubmitButton } from "../styles";

interface CustomInputProps {
  allowSpace: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  onSubmitClick: (value: string) => void;
  onCancelClick: () => void;
}

const CustomInput = (p: CustomInputProps) => {
  const [customValue, setCustomValue] = useState("");

  return (
    <StyledUl style={{ height: 70, justifyContent: "left" }}>
      <StyledInput
        placeholder={p.placeholder || "Add Custom"}
        type="text"
        value={customValue}
        style={p.style}
        onChange={(event) => {
          const val = p.allowSpace ? event.target.value : event.target.value.replace(/ /g, "");
          setCustomValue(val);
        }}
      />
      <SubmitButton
        type="submit"
        style={{
          marginLeft: 10,
          backgroundColor: customValue.length === 0 ? "lightgrey" : "#2173FF",
          width: 70,
        }}
        disabled={customValue.length === 0}
        onClick={() => p.onSubmitClick(customValue)}
      >
        <span>Add</span>
      </SubmitButton>
      <SubmitButton
        type="submit"
        style={{
          marginLeft: 10,
          backgroundColor: "lightgrey",
          width: 70,
        }}
        onClick={() => p.onCancelClick()}
      >
        <span>Cancel</span>
      </SubmitButton>
    </StyledUl>
  );
};

export default CustomInput;
