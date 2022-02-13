import { W250Button } from "components/Button";
import { useNavigate } from "react-router-dom";
import { Header } from "components/typos";
import imgDiver from "utils/logo/diver.svg";
import React, { ReactNode } from "react";
import { Container, StyledCard, Image, ButtonContainer } from "./styles";

interface ErrorProps {
  header?: ReactNode;
}

export const HeaderOnlyError = ({ header }: ErrorProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Container>
      <StyledCard className="container text-center">
        <Image alt="" src={imgDiver} />
        <Header className="text-dark">{header}</Header>
        <ButtonContainer>
          <W250Button
            variant="blue"
            className="mr-2"
            onClick={() => {
              navigate(-1);
            }}
          >
            Go back
          </W250Button>
        </ButtonContainer>
      </StyledCard>
    </Container>
  );
};
