import React from "react";
import styled from "styled-components";

const LoadingContainer = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: grey;
`;

interface Props {
  title?: string | undefined;
  style?: React.CSSProperties;
}

const LoadingText: React.FC<Props> = (props) => {
  const { title, style } = props;
  return <LoadingContainer style={style}>{`${title || "Loading..."}`}</LoadingContainer>;
};

export default LoadingText;
