import styled from "styled-components";

export const ListItemSepByComa = styled.span`
  &:not(:last-child)::after {
    content: ", ";
  }
`;
