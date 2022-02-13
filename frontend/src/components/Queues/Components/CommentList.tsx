import { OwnerProps } from "sardine-dashboard-typescript-definitions";
import { Container, HorizontalContainer, StyledUserPhoto } from "../styles";
import { StyledTitleName } from "../../Dashboard/styles";

export interface ICommentProps {
  id: string;
  time: string;
  comment: string;
  color: string;
  owner: OwnerProps;
}

interface ICommentViewProps {
  isLoadingComments: boolean;
  data: ICommentProps[] | undefined;
}

const CommentList = (props: ICommentViewProps): JSX.Element => {
  const { isLoadingComments, data } = props;
  return (
    <Container style={{ paddingTop: 10 }}>
      {isLoadingComments ? (
        <StyledTitleName
          style={{
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Loading Comments...
        </StyledTitleName>
      ) : (
        data &&
        data?.map((c) => (
          <HorizontalContainer key={c.id} style={{ alignItems: "center", paddingTop: 20 }}>
            <StyledUserPhoto style={{ backgroundColor: c.color }}>{(c.owner.name || "-").slice(0, 1)}</StyledUserPhoto>
            <Container>
              <HorizontalContainer style={{ marginLeft: 10, marginTop: 20 }}>
                <StyledTitleName
                  style={{
                    fontSize: 18,
                    fontWeight: "normal",
                    color: "#001932",
                  }}
                >
                  {c.owner.name || "-"}
                </StyledTitleName>
                <StyledTitleName
                  style={{
                    fontSize: 14,
                    fontWeight: "normal",
                    color: "#B9C5E0",
                    marginLeft: 10,
                  }}
                >
                  {c.time}
                </StyledTitleName>
              </HorizontalContainer>
              <StyledTitleName
                style={{
                  fontSize: 14,
                  fontWeight: "normal",
                  color: "#325078",
                  marginLeft: 10,
                }}
              >
                {c.comment}
              </StyledTitleName>
            </Container>
          </HorizontalContainer>
        ))
      )}
    </Container>
  );
};

export default CommentList;
