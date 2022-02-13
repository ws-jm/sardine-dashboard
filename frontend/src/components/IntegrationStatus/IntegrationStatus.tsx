import { getHealthCheckEvents, getHealthCheckInboundRequest, getHealthCheckOutboundRequest, getClientIdObject } from "utils/api";
import { StyledStickyNav } from "components/Dashboard/styles";
import React, { useMemo, useState } from "react";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { StyledMainDiv } from "styles/Layout";
import { DetailsHeaderTile, TableWrapper } from "styles/EntityList";
import FilterField, { getFilters } from "components/Common/FilterField";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { useNavigate, useLocation } from "react-router-dom";
import OrganisationDropDown from "components/Dropdown/OrganisationDropDown";
import { useSearchQuery } from "hooks/useSearchQuery";
import { useQuery as useReactQuery, UseQueryResult } from "react-query";
import { constructFiltersQueryParams } from "utils/constructFiltersQueryParams";
import { Tabs, Tab } from "react-bootstrap";
import { createJSONCell } from "components/JsonViewer";
import { useCookies } from "react-cookie";
import Layout from "../Layout/Main";
import { DataTable, DataColumn, DataColumnSimple } from "../Common/DataTable";
import { StyledNavTitle, StyledTitleName } from "../Dashboard/styles";
import { StyledDropdownDiv, TabsContainer } from "./styles";

export const INTEGRATION_STATUS_PATH = "/integration-status";

const searchFields = ["day"];

const requestColumns: DataColumn<AnyTodo>[] = [
  {
    title: "Timestamp",
    field: "timestamp.value",
  },
  {
    title: "Request Body",
    field: "request_body",
    render: createJSONCell("request_body"),
  },
  {
    title: "Response Body",
    field: "response_body",
    render: createJSONCell("response_body"),
  },
  {
    title: "Response Status Code",
    field: "response_status_code",
  },
  {
    title: "Latency",
    field: "latency",
  },
  {
    title: "Request ID",
    field: "request_id",
  },
  {
    title: "Method",
    field: "method",
  },
  {
    title: "Request Params",
    field: "request_params",
    render: createJSONCell("request_params"),
  },
];

const outboundRequestColumns: DataColumn<AnyTodo>[] = [
  {
    title: "Url",
    field: "url",
  },
  ...requestColumns,
  {
    title: "Returned Cached Response",
    field: "returned_cached_response",
  },
];

const inboundRequestColumns: DataColumn<AnyTodo>[] = [
  {
    title: "Endpoint",
    field: "endpoint",
  },
  ...requestColumns,
  {
    title: "Is Internal",
    field: "is_internal",
  },
];

const eventColumns: DataColumnSimple[] = [
  {
    title: "OS Family",
    field: "os_family",
  },
  {
    title: "SDK version",
    field: "sdk_version",
  },
  {
    title: "Remote IP",
    field: "remote_ip",
  },
  {
    title: "Soure",
    field: "source",
  },
  {
    title: "Time",
    field: "time.value",
  },
  {
    title: "User ID Hash",
    field: "user_id_hash",
  },
  {
    title: "Flow",
    field: "flow",
  },
];

type HealthCheckSectionAccessor = "inboundRequests" | "outboundRequests" | "events";

type TypeCheckSection = {
  name: string;
  accessor: HealthCheckSectionAccessor;
  requestState: UseQueryResult;
  columns: DataColumn<AnyTodo>[];
};

export const IntegrationStatus: React.FC = () => {
  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, searchFields));
  const navigate = useNavigate();

  const queries = useSearchQuery();
  const [cookies] = useCookies(["organization"]);
  const organisation = cookies.organization || queries.get("client");

  const [tabActiveKeySet, setTabActiveKeySet] = useState<Set<HealthCheckSectionAccessor>>(new Set(["inboundRequests" as const]));

  const { data: clientIdData } = useReactQuery(String(organisation), () => getClientIdObject(String(organisation)), {
    enabled: Boolean(organisation),
  });

  const shouldFetchIntegrationHealthCheck = useMemo(() => {
    // if has client query, and its data hasn't finished loading
    if (organisation && !clientIdData) {
      return false;
    }

    return true;
  }, [organisation, clientIdData]);

  const getInboundRequestState = useReactQuery(
    "getHealthCheckInboundRequests",
    () => getHealthCheckInboundRequest(filters, clientIdData?.client_id),
    {
      enabled: shouldFetchIntegrationHealthCheck && tabActiveKeySet.has("inboundRequests"),
    }
  );

  const queryOutboundRequetState = useReactQuery(
    "getHealthCheckOutboundRequests",
    () => getHealthCheckOutboundRequest(filters, clientIdData?.client_id),
    {
      enabled: shouldFetchIntegrationHealthCheck && tabActiveKeySet.has("outboundRequests"),
    }
  );

  const getEventRequestState = useReactQuery(
    "getHealthCheckEvents",
    () => getHealthCheckEvents(filters, clientIdData?.client_id),
    {
      enabled: shouldFetchIntegrationHealthCheck && tabActiveKeySet.has("events"),
    }
  );

  const sections: TypeCheckSection[] = [
    {
      name: "Inbound Request",
      accessor: "inboundRequests",
      requestState: getInboundRequestState,
      columns: inboundRequestColumns,
    },
    {
      name: "Outbound request",
      accessor: "outboundRequests",
      requestState: queryOutboundRequetState,
      columns: outboundRequestColumns,
    },
    { name: "Events", accessor: "events", requestState: getEventRequestState, columns: eventColumns },
  ];

  const updateFilters = (newOrganisation?: string) => {
    const { searchString } = constructFiltersQueryParams(
      filters,
      typeof newOrganisation === "string" ? newOrganisation : organisation
    );
    navigate(`${INTEGRATION_STATUS_PATH}?${searchString}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const tabOnSelect = (key: HealthCheckSectionAccessor) => {
    setTabActiveKeySet((set) => new Set(Array.from(set).concat(key)));
  };

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="document-verifications" className="m-2">
          <StyledNavTitle className="w-100">
            <StyledTitleName>Integration Status</StyledTitleName>
            <StyledDropdownDiv>
              <OrganisationDropDown organisation={organisation} changeOrganisation={updateFilters} />
            </StyledDropdownDiv>
          </StyledNavTitle>
        </StyledStickyNav>
        <FilterField
          className="w-100"
          placeholder="Search here"
          filters={filters}
          fields={searchFields}
          onFiltersUpdate={setFilters}
          onApply={updateFilters}
          enableDurationSearch={false}
        />
        <TabsContainer>
          <Tabs onSelect={(key) => tabOnSelect(key as HealthCheckSectionAccessor)}>
            {sections.map(({ name, accessor, requestState, columns }) => (
              <Tab
                eventKey={accessor}
                title={<DetailsHeaderTile style={{ fontWeight: 600, color: "var(--dark-14)" }}>{name}</DetailsHeaderTile>}
              >
                <TableWrapper>
                  <HandleInlineError isError={Boolean(requestState?.isError)}>
                    <DataTable
                      columns={columns}
                      data={(requestState?.data as AnyTodo[]) || []}
                      title={name}
                      isLoading={requestState?.isLoading}
                    />
                  </HandleInlineError>
                </TableWrapper>
              </Tab>
            ))}
          </Tabs>
        </TabsContainer>
      </StyledMainDiv>
    </Layout>
  );
};
