import { Card } from "react-bootstrap";
import styled from "styled-components";

export const ImageContainer = styled(Card.Body)`
  display: flex;
`;

export const ImageLink = styled.a`
  max-height: 600px;
  margin-right: 10px;
  img {
    object-fit: contain;
    width: auto;
    max-width: 100%;
    height: 100%;
    object-position: left;
  }
`;
