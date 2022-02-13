import styled from "styled-components";
import { StyledTitleName } from "components/Dashboard/styles";

// TODO(nghia): reuse components, grep dupplicated styles and ref to here later
export const TableWrapper = styled.div`
  margin: 30px 0;
  width: inherit;
`;

export const DetailsHeaderParent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 250px);
  grid-auto-rows: auto;
`;

export const DetailsHeaderChild = styled.div`
  margin: 10px 10px;
`;

export const DetailsHeaderValue = styled.div`
  font-family: IBM Plex Sans;
  letter-spacing: 0em;
  text-align: left;
  line-break: anywhere;
  font-size: 14px;
  color: var(--dark-14);
`;

export const DetailsHeaderTile = styled(StyledTitleName)`
  font-size: 14px;
  color: rgb(144, 155, 173);
  font-weight: normal;
`;
