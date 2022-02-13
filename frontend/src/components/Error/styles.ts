import styled from "styled-components";
import { Card } from "../Card";

export const Image = styled.img`
  margin-bottom: 50px;
`;

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  height: 0;
  width: 100vw;
  height: 100vh;
`;

export const StyledCard = styled(Card)`
  padding: 100px;
`;

export const ButtonContainer = styled.div`
  margin-top: 50px;
`;
