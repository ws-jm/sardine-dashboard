import { useEffect, useState } from "react";
import { StyledMainDiv } from "styles/Layout";
import { StyledNavTitle, StyledStickyNav } from "components/Dashboard/styles";
import { Breadcumb, HeaderSectionContainer } from "styles/EntityDetail";
import { DetailsHeaderChild, DetailsHeaderParent, DetailsHeaderTile, DetailsHeaderValue } from "styles/EntityList";
import { startCase } from "lodash-es";
import { useGetFallbackHistoryState } from "utils/openUrlNewTabWithHistoryState";
import { DocumentVerification } from "sardine-dashboard-typescript-definitions";
import { useQuery as useReactQuery } from "react-query";
import { getDocumentVerification, getDocumentVerificationsImages } from "utils/api";
import { useParams } from "react-router-dom";
import { InlineGenericError } from "components/Error/InlineGenericError";
import Loader from "components/Common/Loader";
import Badge from "components/Common/Badge";
import { headerFields } from "./data";
import Layout from "../../Layout/Main";
import { CapturedDocumentsSection, DocumentInformationSection } from "./sections";
import { FogeryTestResultsSection } from "./sections/FogeryTestResults";

export const DocumentVerificationsDetail = () => {
  const documentVerificationFromHistoryState: (DocumentVerification & { hasImages: boolean }) | null =
    useGetFallbackHistoryState();

  const { id } = useParams<{ id: string }>();

  // either from network, from cache, calculated in loadDocumentVerification
  const [documentVerification, setDocumentVerification] = useState<DocumentVerification>();

  const {
    data: documentImages,
    error: errorLoadingDocumentImages,
    isLoading: isLoadingDocumentImages,
  } = useReactQuery(
    "documentImages",
    () =>
      getDocumentVerificationsImages(
        documentVerificationFromHistoryState?.front_image_path,
        documentVerificationFromHistoryState?.back_image_path,
        documentVerificationFromHistoryState?.selfie_path
      ),
    {
      enabled: Boolean(documentVerificationFromHistoryState) && !documentVerificationFromHistoryState?.hasImages,
    }
  );

  const {
    data: documentVerificationFromNetwork,
    error: errorLoadingDocumentVerification,
    isLoading: isLoadingDocumentVerification,
  } = useReactQuery("documentVerification", () => getDocumentVerification(id || ""), {
    enabled: !documentVerificationFromHistoryState,
  });

  const loadDocumentVerification = () => {
    if (documentVerificationFromHistoryState?.hasImages) {
      setDocumentVerification(documentVerificationFromHistoryState);
      return;
    }

    if (documentImages && documentVerificationFromHistoryState) {
      setDocumentVerification({ ...documentVerificationFromHistoryState, ...documentImages });
      return;
    }

    if (documentVerificationFromNetwork) {
      setDocumentVerification(documentVerificationFromNetwork);
    }
  };

  useEffect(loadDocumentVerification, [documentImages, documentVerificationFromHistoryState, documentVerificationFromNetwork]);

  const isError = errorLoadingDocumentImages || errorLoadingDocumentVerification;
  const isLoading = isLoadingDocumentImages || isLoadingDocumentVerification;

  const renderMainContent = () => {
    if (isError) {
      return <InlineGenericError />;
    }
    if (isLoading || !documentVerification) {
      return <Loader />;
    }

    const images = [
      { src: documentVerification.front_image_path, alt: "front document" },
      { src: documentVerification.back_image_path, alt: "back document" },
      { src: documentVerification.selfie_path, alt: "selfie" },
    ].filter((image) => image.src);

    return (
      <>
        <HeaderSectionContainer>
          <DetailsHeaderParent className="w-100">
            {headerFields.map(({ key, highFirstOrder }) => {
              const value = documentVerification[key];
              if (!value) return null;
              return (
                <DetailsHeaderChild key={key}>
                  <DetailsHeaderTile>{startCase(key)}</DetailsHeaderTile>
                  <DetailsHeaderValue>
                    {highFirstOrder ? <Badge highFirstOrder={highFirstOrder} title={String(value)} /> : value}
                  </DetailsHeaderValue>
                </DetailsHeaderChild>
              );
            })}
          </DetailsHeaderParent>
        </HeaderSectionContainer>

        <CapturedDocumentsSection images={images} />
        <DocumentInformationSection documentData={documentVerification?.document_data} />
        <FogeryTestResultsSection results={documentVerification?.forgery_test_results} />
      </>
    );
  };

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav className="m-2" id="document-verifications-details">
          <StyledNavTitle>
            <Breadcumb>{"Document Verifications > Details"}</Breadcumb>
          </StyledNavTitle>
        </StyledStickyNav>
        {renderMainContent()}
      </StyledMainDiv>
    </Layout>
  );
};
