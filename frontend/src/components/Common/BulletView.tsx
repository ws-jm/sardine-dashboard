import styled from "styled-components";
import { Link } from "./Links";

export const BulletContainer = styled.div`
  max-height: 250px;
  overflow-y: scroll;
  margin: 10px 0px;
`;

interface IProps {
  data: string;
  isLink?: boolean;
}

const BulletView = (props: IProps): JSX.Element => {
  const { data, isLink = false } = props;

  return (
    <BulletContainer>
      {data.includes && data.includes(", ") ? (
        data
          .split(", ")
          .filter((v: string) => v !== "")
          .map((v: string) => (
            <li key={v}>
              {isLink ? (
                <Link id="social_link" href={encodeURIComponent(v)} rel="noreferrer" target="_blank">
                  {v || "-"}
                </Link>
              ) : (
                v
              )}
              <br />
            </li>
          ))
      ) : isLink ? (
        <Link id="social_link" href={encodeURIComponent(data)} rel="noreferrer" target="_blank">
          {data || "-"}
        </Link>
      ) : (
        data
      )}
    </BulletContainer>
  );
};

export default BulletView;
