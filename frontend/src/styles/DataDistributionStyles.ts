import styled from "styled-components";

export const BackgroundBox = styled.div`
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.05);
  @media (max-width: 760px) {
    border-radius: 10px 10px 0px 0px;
  }
`;

export const ChartContainer = styled.div`
  padding: 12px;
`;
