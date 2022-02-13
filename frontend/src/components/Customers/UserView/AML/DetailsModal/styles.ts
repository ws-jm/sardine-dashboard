import styled from "styled-components";

export const ListItem = styled.span`
  &:not(:last-child)::after {
    content: ", ";
  }
`;
