import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 23px;
  width: max-content;
  border-radius: 5px;
`;

const Title = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  padding: 10px;
`;

interface IProps {
  title: string;
  style?: React.CSSProperties;
  highFirstOrder?: boolean;
}

const colorsByLevel = ["#00D060", "#FFBE18", "#FD6871"];

const keyWordsByLevel = [
  ["low", "low_risk", "resolved", "verified"],
  ["medium", "medium_risk", "medium_low", "low_medium_risk", "in progress", "in-progress", "moderate"],
  ["high", "high_risk", "very_high", "very_high_risk", "very high", "pending", "not verified"],
];

const Badge: React.FC<IProps> = (props) => {
  const { title, highFirstOrder, style } = props;
  const getColorCode = () => {
    const sortedKeyWordsByLevel = highFirstOrder ? keyWordsByLevel.slice().reverse() : keyWordsByLevel;

    const level = sortedKeyWordsByLevel.findIndex((keyWords) => keyWords.includes(title.toLowerCase()));
    if (level === -1) return "gray";
    return colorsByLevel[level];
  };

  const colorCode = getColorCode();

  return (
    <Container style={{ backgroundColor: `${colorCode}10`, ...style }}>
      <div style={{ marginLeft: 10, width: 8, height: 8, borderRadius: "50%", backgroundColor: colorCode }} />
      <Title style={{ color: colorCode }}>{title}</Title>
    </Container>
  );
};

export default Badge;
