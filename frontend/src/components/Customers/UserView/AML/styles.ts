import styled from "styled-components";
import { StyledTh as BaseTh } from "../../styles";

export const Tbody = styled.tbody`
  tr:hover {
    color: #ffffff;
    background-color: #325078;

    button {
      color: #fff;
      border-color: white;
      background: transparent;
    }
  }
`;

export const ListSignalContainer = styled.li`
  margin-bottom: 20px;
`;

export const StyledTh = styled(BaseTh)<{ index: number }>`
  text-align: left;
  width: ${(props) => (props.index === 0 ? "20%" : "auto")};
`;
