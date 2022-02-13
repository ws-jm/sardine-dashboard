import styled from "styled-components";
import Badge from "components/Common/Badge";
import { CardText, CardTitle, CardGridItem, CardBody } from "styles/Card";
import { headerFields, imageFields } from "components/DocumentVerifications/DocumentVerificationsDetails/data";
import { startCase } from "lodash-es";
import { MouseEvent } from "react";
import { DocumentVerification } from "sardine-dashboard-typescript-definitions";
import { DOCUMENT_VERIFICATIONS_PATH } from "modulePaths";
import { openUrlNewTabWithHistoryState } from "utils/openUrlNewTabWithHistoryState";
import { useNavigate } from "react-router-dom";
import { CardTextWithBadge } from "./styles";

interface DocumentVerificationSectionProps {
  documentVerification: DocumentVerification;
}

const ViewDetailsGridItem = styled(CardGridItem)`
  display: flex;
  align-items: center;
`;

export const DocumentVerificationSection = ({ documentVerification }: DocumentVerificationSectionProps): JSX.Element => {
  const navigate = useNavigate();

  const viewDetails = (event: MouseEvent) => {
    const url = `${DOCUMENT_VERIFICATIONS_PATH}/${documentVerification.verification_id}`;
    const historyState = { ...documentVerification, hasImages: true };

    if (event.metaKey) {
      openUrlNewTabWithHistoryState(url, historyState);
      return;
    }

    navigate(url, {
      state: historyState,
    });
  };

  return (
    <CardBody isGrid>
      {headerFields.map(({ key, highFirstOrder }) => {
        const value = documentVerification[key];
        if (!value) return null;

        const valueToString = String(value);

        return (
          <CardGridItem key={key}>
            <CardTitle>{startCase(key)}</CardTitle>
            {highFirstOrder ? (
              <CardTextWithBadge>
                <Badge highFirstOrder={highFirstOrder} title={valueToString} />
              </CardTextWithBadge>
            ) : (
              <CardText>{valueToString}</CardText>
            )}
          </CardGridItem>
        );
      })}
      {imageFields.map((key) => {
        const src = String(documentVerification[key]);
        if (!src) return null;
        return (
          <CardGridItem key={key}>
            <CardTitle>{startCase(key)}</CardTitle>
            <CardText>
              <img alt="" className="w-100" src={src} />
            </CardText>
          </CardGridItem>
        );
      })}

      <ViewDetailsGridItem>
        <button onClick={viewDetails} className="btn-link btn text-primary" type="button">
          View details
        </button>
      </ViewDetailsGridItem>
    </CardBody>
  );
};
