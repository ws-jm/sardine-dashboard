import styled from "styled-components";
import { Card } from "react-bootstrap";

// TODO(nghia): reuse components, grep dupplicated styles and ref to here later
export const CardTitle = styled(Card.Title)`
  font-size: 15px;
  margin-bottom: 3px;
  text-transform: "capitalize";
`;

export const CardText = styled(Card.Text)`
  font-size: 14px;
`;

// TODO(nghia): reuse components, grep dupplicated styles and ref to here later
export const CardBody = styled(Card.Body)<{ isGrid: boolean }>`
  ${({ isGrid }) =>
    isGrid &&
    `
display: grid;
grid-template-columns: repeat(auto-fill, 250px);
grid-auto-rows: "auto";
  `}
`;

export const CardGridItem = styled.div`
  margin: 10px 20px;
`;
