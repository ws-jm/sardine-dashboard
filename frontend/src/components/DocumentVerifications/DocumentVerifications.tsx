import React, { useMemo, useState } from "react";
import { StyledMainDiv } from "styles/Layout";
import { TableWrapper } from "styles/EntityList";
import FilterField, { getFilters } from "components/Common/FilterField";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { useNavigate, useLocation } from "react-router-dom";
import { useInfiniteQuery, useQuery as useReactQuery } from "react-query";
import { DOCUMENT_VERIFICATIONS_PATH } from "modulePaths";
import { getClientIdObject, getDocumentVerifications } from "utils/api";
import { DocumentVerification } from "sardine-dashboard-typescript-definitions";
import OrganisationDropDown from "components/Dropdown/OrganisationDropDown";
import { useSearchQuery } from "hooks/useSearchQuery";
import { openUrlNewTabWithHistoryState } from "utils/openUrlNewTabWithHistoryState";
import { CLIENT_QUERY_FIELD, constructFiltersQueryParams } from "utils/constructFiltersQueryParams";
import * as Sentry from "@sentry/react";
import { useCookies } from "react-cookie";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import { DataTable, useHandleRowClick, DataColumnSimple } from "../Common/DataTable";
import { StyledNavTitle, StyledTitleName } from "../Dashboard/styles";
import { StyledDropdownDiv, StyledStickyNav } from "./styles";

const tableColumns: DataColumnSimple[] = [
  {
    title: "Session key",
    field: "session_key",
  },
  {
    title: "Verification ID",
    field: "verification_id",
  },
  {
    title: "Customer ID",
    field: "customer_id",
  },
  {
    title: "Country",
    field: "document_data.issuingCountry",
  },
  {
    title: "Document Type",
    field: "document_data.type",
  },
  {
    title: "Time stamp",
    field: "timestamp",
  },
  {
    title: "Risk Level",
    field: "risk_level",
  },
  { title: "Forgery Level", field: "forgery_level" },
  { title: "Face Match Level", field: "face_match_level" },
  { title: "Document Match Level", field: "document_match_level" },
  { title: "Image Quality Level", field: "image_quality_level" },
];

const searchFields = [
  "session_key",
  "verification_id",
  "customer_id",
  "risk_level",
  "document_match_level",
  "forgery_level",
  "image_quality_level",
  "face_match_level",
];

export const DocumentVerifications: React.FC = () => {
  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, searchFields));
  const navigate = useNavigate();

  const [cookies] = useCookies(["organization"]);

  const pushToDetails = (event: MouseEvent, rowData: DocumentVerification) => {
    const url = `${DOCUMENT_VERIFICATIONS_PATH}/${rowData.verification_id}`;

    if (event.metaKey) {
      openUrlNewTabWithHistoryState(url, rowData);
      return;
    }

    navigate(url, {
      state: rowData,
    });
  };
  const handleRowClick = useHandleRowClick(pushToDetails);
  const queries = useSearchQuery();
  const organisation = cookies.organization || queries.get(CLIENT_QUERY_FIELD);

  const { data: clientIdData } = useReactQuery(String(organisation), () => getClientIdObject(String(organisation)), {
    enabled: Boolean(organisation),
  });
  const shouldFetchDocumentVerifications = () => {
    // if has client query, and its data hasn't finished loading
    if (organisation && !clientIdData) {
      return false;
    }

    return true;
  };

  const { isLoading, isError, data, fetchNextPage, isFetching } = useInfiniteQuery(
    "getDocumentVerifications",
    ({ pageParam: pageCursor }) => getDocumentVerifications(filters, clientIdData?.client_id || "", pageCursor),
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage) => lastPage.pageCursor,
      enabled: shouldFetchDocumentVerifications(),
    }
  );

  const tableData = useMemo(
    () =>
      data?.pages.reduce<DocumentVerification[]>(
        (aggregatedData, pageData) => aggregatedData.concat(pageData.documentVerifications),
        []
      ) || [],
    [data?.pages]
  );

  const updateFilters = (newOrganisation?: string) => {
    const { searchString } = constructFiltersQueryParams(
      filters,
      typeof newOrganisation === "string" ? newOrganisation : organisation
    );
    navigate(`${DOCUMENT_VERIFICATIONS_PATH}?${searchString}`);
    navigate(0);
  };

  const isSuperAdmin = useUserStore(selectIsAdmin);

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="document-verifications" className="m-2">
          <StyledNavTitle className="w-100">
            <StyledTitleName>Document Verfications</StyledTitleName>
            {isSuperAdmin && (
              <StyledDropdownDiv>
                <OrganisationDropDown organisation={organisation} changeOrganisation={updateFilters} />
              </StyledDropdownDiv>
            )}
          </StyledNavTitle>
        </StyledStickyNav>
        <FilterField
          placeholder="Search here"
          filters={filters}
          fields={searchFields}
          onFiltersUpdate={setFilters}
          onApply={updateFilters}
          enableDurationSearch={false}
        />
        <TableWrapper>
          <HandleInlineError isError={isError}>
            <DataTable
              onChangePage={(page: number, pageSize: number) => {
                const totalPages = Math.ceil((tableData.length || 0) / pageSize);
                if (totalPages - page - 1 <= 0) {
                  fetchNextPage()
                    .then()
                    .catch((err) => Sentry.captureException(err));
                }
              }}
              columns={tableColumns}
              data={tableData}
              title=""
              isLoading={isLoading || isFetching}
              onRowClick={handleRowClick}
            />
          </HandleInlineError>
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};
