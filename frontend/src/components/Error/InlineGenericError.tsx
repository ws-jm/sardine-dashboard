import { FC } from "react";
import { W250Button } from "components/Button";
import { useNavigate } from "react-router-dom";
import { Header, Paragraph } from "components/typos";
import imgDiver from "utils/logo/diver.svg";
import { StyledCard, Image, ButtonContainer } from "./styles";

export const InlineGenericError: FC<unknown> = () => {
  const navigate = useNavigate();
  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <StyledCard className="text-center">
      <Image alt="" src={imgDiver} />
      <Header className="text-dark">Something went wrong on our end</Header>
      <Paragraph className="text-primary">
        This error is reported automatically. We are fixing this issue. Please, try again later.
      </Paragraph>
      <ButtonContainer>
        <W250Button
          variant="outline-secondary"
          className="mr-2"
          onClick={() => {
            navigate(-1);
          }}
        >
          Go back
        </W250Button>
        <W250Button variant="blue" color="#FFFFFF" onClick={reloadPage}>
          Try again
        </W250Button>
      </ButtonContainer>
    </StyledCard>
  );
};

export const HandleInlineError: FC<{ isError: boolean }> = ({ isError, children }) => {
  if (isError) {
    return <InlineGenericError />;
  }

  return <>{children}</>;
};
