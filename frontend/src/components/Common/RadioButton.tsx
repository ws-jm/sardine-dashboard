import React from "react";
import styled from "styled-components";
import { RadioButtonUncheckedOutlined, CheckOutlined } from "@material-ui/icons";

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 5px;
  margin: 10px 0;
`;

const Title = styled.div`
  text-align: center;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  margin-left: 10px;
`;

export const RadioOption = styled.div`
  width: 24px;
  height: 24px;
  background: #325078;
  margin: 8px 10px;
`;

interface IProps {
  selected: boolean;
  title?: string;
  isCheckBox?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

const RadioButton: React.FC<IProps> = (props) => {
  const { title, selected, isDisabled, isCheckBox, style, onClick } = props;

  const innerStyle = {
    background: selected ? "#2173FF" : isDisabled ? "lightgrey" : "#B9C5E0",
    color: selected ? "#FFFFFF" : "transparent",
    borderRadius: isCheckBox ? "5px" : "100%",
    marginLeft: 5,
  };

  return (
    <Container
      key={title}
      style={{ background: selected && isDisabled ? "lightgrey" : "transparent", ...style }}
      onClick={isDisabled ? () => {} : onClick}
    >
      {selected ? <CheckOutlined style={innerStyle} /> : <RadioButtonUncheckedOutlined style={innerStyle} />}
      {title ? <Title>{title}</Title> : null}
    </Container>
  );
};

export default RadioButton;
