import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import moment from "moment";
import { AnyTodo, CustomersResponse, Rule } from "sardine-dashboard-typescript-definitions";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { isErrorWithResponseStatus } from "utils/errorUtils";
import * as Sentry from "@sentry/react";
import { CUSTOMERS_PATH, SESSION_DETAILS_PATH } from "modulePaths";
import { useCookies } from "react-cookie";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "store/user";
import { getClientFromQueryParams } from "utils/getClientFromQueryParams";
import Layout from "../components/Layout/Main";
import { StoreCtx } from "../utils/store";
import OrganisationDropDown from "../components/Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import { ActionTypes } from "../utils/store/actionTypes";
import { getCustomers, getClientIdObject, getSessions, getRules } from "../utils/api";
import { DatesProps } from "../utils/store/interface";
import { DataTable, DataCell, DataColumn, MaterialTableComponents, ToolBarWithTitle } from "../components/Common/DataTable";
import FilterField, { FilterData, getFilters } from "../components/Common/FilterField";
import { StyledMainDiv, TableWrapper } from "../components/Customers/styles";
import { DATASTORE_START_DATE, DATE_FORMATS, TIMEZONE_TYPES, TIME_UNITS } from "../constants";
import { convertDatastoreSessionToCustomerResponse, sessionToAddressFields } from "../utils/customerSessionUtils";
import { openUrlNewTabWithHistoryState } from "../utils/openUrlNewTabWithHistoryState";
import { datetimeToTimestamp } from "../utils/timeUtils";
import Badge from "../components/Common/Badge";

interface TableLocalization {
  toolbar: {
    exportCSVName: string;
  };
}

// TODO: Move it to customerSessionUtils.ts
export function convertToCustomerResponse(r: AnyTodo): CustomersResponse {
  let timestamp: string;
  if (r.timestamp) {
    timestamp = typeof r.timestamp === "object" ? r.timestamp.value : r.timestamp;
  } else {
    timestamp = "";
  }
  return {
    client_id: `${r.client_id || ""}`,
    customer_id: r.user_id_hash || r.customer_id || "",
    flow: "",
    first_name: `${r.first_name || ""}`,
    last_name: `${r.last_name || ""}`,
    phone: r.phone || "",
    email_address: r.email_address || "",
    is_email_verified: r.isEmailVerified || true,
    is_phone_verified: r.isPhoneVerified || true,
    device_id: r.device_id || "",
    date_of_birth: r.dateOfBirth || "",
    customer_score: `${r.customer_score || 0}`,
    email_reason_codes: `${r.email_reason_codes || ""}`,
    phone_reason_codes: `${r.phone_reason_codes || ""}`,
    phone_level: `${r.phone_level || ""}`,
    email_level: `${r.email_risk_level || ""}`,
    email_domain_level: `${r.emailDomainLevel || ""}`,
    risk_level: `${r.risk_level || ""}`,
    reason_codes: [],
    session_key: `${r.session_key || ""}`,
    created_date: `${r.created_date ? r.created_date.value : ""}`,
    customer_risk_level: `${r.customer_risk_level || ""}`,
    device_risk_level: `${r.device_risk_Level || ""}`,
    browser: `${r.browser || ""}`,
    os: `${r.os || ""}`,
    true_os: `${r.trueOS || ""}`,
    device_ip: `${r.device_ip || ""}`,
    ip_city: "",
    ip_region: "",
    ip_country: "",
    remote_desktop: `${r.remoteDesktop || ""}`,
    emulator: `${r.emulator || ""}`,
    proxy: `${r.proxy || ""}`,
    ip_type: `${r.IpType || ""}`,
    vpn: `${r.vpn || ""}`,
    address_fields_list: [sessionToAddressFields(r)] || [],
    timestamp,

    // Tax ID and sentilink
    abuse_score: r.abuse_score || 0,
    first_party_synthetic_score: r.first_party_synthetic_score || 0,
    id_theft_score: r.id_theft_score || 0,
    name_dob_shared_count: r.name_dob_shared_count || 0,
    name_ssn_synthetic_address: r.name_ssn_synthetic_address || false,
    ssn_bogus: r.ssn_bogus || false,
    ssn_history_longer_months: r.ssn_history_longer_months || 0,
    ssn_issuance_before_dob: r.ssn_issuance_before_dob || false,
    ssn_issuance_dob_mismatch: r.ssn_issuance_dob_mismatch || false,
    ssn_shared_count: 0,
    ssn_names_exact_match: r.ssn_names_exact_match || [],
    ssn_phones_exact_match: r.ssn_phones_exact_match || [],
    ssn_emails_exact_match: r.ssn_emails_exact_match || [],
    ssn_dobs_exact_match: r.ssn_dobs_exact_match || [],
    tax_id: r.taxId || "",
    tax_id_name_match: r.taxIdNameMatch || "",
    tax_id_dob_match: r.taxIdDOBMatch || "",
    tax_id_state_match: r.taxIdStateMatch || "",
    tax_id_match: r.taxIdMatch || "",
    tax_id_level: r.taxIdLevel || "",

    // Additional fields from metabse dashboard 101 query
    transaction_id: r.transaction_id || "",
    transaction_amount: r.transaction_amount || "",
    transaction_currency_code: r.transaction_currency_code || "",
    carrier: r.carrier || "",
    phone_country: r.phone_country || "",
    name_score: r.name_score || "",
    address_score: r.address_score || "",
    risk_band: r.risk_band || "",
    email_reason: r.email_reason || "",
    email_owner_name: r.owner_name || "",
    email_owner_name_match: r.owner_name_match || "",
    location: `${r.location || ""}`,
    facebook_Link: r.facebook_Link || "",
    Twitter_Link: r.Twitter_Link || "",
    LinkedIn_Link: r.LinkedIn_Link || "",
    phonescore_reason: r.phonescore_reason || "",
    email_phone_risk_level: r.email_phone_risk_level || "",
    billaddress_reason: r.billaddress_reason || "",
    latitude: r.latitude || "",
    longitude: r.longitude || "",
    rules_executed: [],

    id: r.id || "",
    owner: r.owner,
    status: r.status || "Pending",
    decision: r.decision || "",
    queue_id: r.queue_id || [],
    third_party_synthetic_score: r.third_party_synthetic_score || "",
  };
}

const WHITELISTED_QUERY_FIELDS = [
  "session_key",
  "customer_id",
  "transaction_id",
  "customer_risk_level",
  "flow",
  "rule_id",
  "first_name",
  "last_name",
  "phone",
  "email_address",
  "country_code",
  "device_id",
  "phone_level",
  "email_level",
  "tax_id_level",
  "adverse_media_level",
  "pep_level",
  "sanction_level",
] as const;

const START_DATE_QUERY_FIELD = "start_date";
const END_DATE_QUERY_FIELD = "end_date";
const CLIENT_QUERY_FIELD = "client";

function getDefaultStartDate(): string {
  return moment().subtract({ days: 1 }).utc().format("YYYY-MM-DD HH:mm:ss");
}

function getDefaultEndDate(): string {
  return moment().utc().format("YYYY-MM-DD HH:mm:ss");
}

// Construct query params from filters
function constructQueryParams(dataFilters: Array<FilterData>, startDate: string, endDate: string, client: string): string {
  const params: { [key: string]: string } = {};

  for (let i = 0; i < dataFilters.length; i += 1) {
    const filter = dataFilters[i];
    if (filter.apply) {
      params[filter.key] = filter.value;
    }
  }

  const startDateOrDefaultValue = startDate || getDefaultStartDate();
  const endDateOrDefaultValue = endDate || getDefaultEndDate();
  params[START_DATE_QUERY_FIELD] = startDateOrDefaultValue;
  params[END_DATE_QUERY_FIELD] = endDateOrDefaultValue;
  params[CLIENT_QUERY_FIELD] = client;
  return new URLSearchParams(params).toString();
}

export function getDatesFromQueryParams(pathSearch: string): DatesProps {
  const searchParams = new URLSearchParams(pathSearch);
  const startDate = searchParams.get(START_DATE_QUERY_FIELD) || getDefaultStartDate();
  const endDate = searchParams.get(END_DATE_QUERY_FIELD) || getDefaultEndDate();

  return { startDate, endDate, selectedDateIndex: 3 };
}

const Cell = (props: {
  rowData: CustomersResponse;
  columnDef: DataColumn<CustomersResponse>;
  cellEditable: boolean;
  errorState: AnyTodo; // MaterialTable's types are not well-defined.
  icons: AnyTodo;
  onCellEditStarted: AnyTodo;
  scrollWidth: number;
  size: "medium";
  value: string;
}) => {
  const { rowData, columnDef, cellEditable, errorState, icons, onCellEditStarted, scrollWidth, size, value } = props;
  if (!rowData) {
    return null;
  }
  const id = `customers_cell_${rowData.customer_id}_${columnDef.field}`;
  return (
    <DataCell
      id={id}
      rowData={rowData}
      columnDef={columnDef}
      cellEditable={cellEditable}
      errorState={errorState}
      icons={icons}
      onCellEditStarted={onCellEditStarted}
      scrollWidth={scrollWidth}
      size={size}
      value={value}
    />
  );
};

interface DataTableOptions {
  debounceInterval: number;
  exportFileName: string;
}

const CustomersDataTable = ({
  columns,
  data,
  title,
  options,
  onRowClick,
  onChangePage,
  isLoading,
  localization,
  components,
}: {
  columns: DataColumn<CustomersResponse>[];
  data: CustomersResponse[];
  title: string;
  options: DataTableOptions;
  onRowClick: (
    event?: React.MouseEvent<Element, MouseEvent> | undefined,
    rowData?: CustomersResponse | undefined,
    toggleDetailPanel?: ((panelIndex?: number | undefined) => void) | undefined
  ) => void;
  onChangePage: (page: number, pageSize: number) => void;
  isLoading: boolean;
  localization: TableLocalization;
  components: MaterialTableComponents;
}): JSX.Element => (
  <DataTable
    columns={columns}
    data={data}
    title={title}
    options={options}
    onRowClick={onRowClick}
    onChangePage={onChangePage}
    isLoading={isLoading}
    localization={localization}
    components={components}
  />
);

const CustomersTableToolbar = ({ data }: { data: AnyTodo }) => <ToolBarWithTitle title="Customer Sessions History" data={data} />;

const Customers = (): JSX.Element => {
  const limit = 100;
  const { state, dispatch } = useContext(StoreCtx);
  const navigate = useNavigate();

  const [cookies] = useCookies(["organization"]);

  const [customersData, setCustomersData] = useState<CustomersResponse[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const { addToast } = useToasts();
  const [clientId, setClientId] = useState("");
  const [clientRules, setClientRules] = useState<Array<Rule>>([]);

  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, WHITELISTED_QUERY_FIELDS));
  const dates = getDatesFromQueryParams(search);
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);

  const useDatastore = startDate >= DATASTORE_START_DATE;
  // Datastore page cursor for sessions
  const [dsPageCursor, setDSPageCursor] = useState("start");

  const { isAdmin, organisationFromUserStore, isSuperAdmin } = useUserStore((state: AnyTodo) => ({
    isAdmin: selectIsAdmin(state),
    isSuperAdmin: selectIsSuperAdmin(state),
    organisationFromUserStore: state.organisation,
  }));
  const organisation =
    cookies.organization ||
    (isAdmin ? getClientFromQueryParams(search, isSuperAdmin, organisationFromUserStore) : organisationFromUserStore);

  const changeOrganisation = (org: string) => {
    navigate(`${CUSTOMERS_PATH}?${constructQueryParams(filters, startDate, endDate, org)}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const updateDate = (index: number, dateData: DatesProps) => {
    const { startDate: startDateVal, endDate: endDateVal } = dateData;
    setStartDate(startDateVal);
    setEndDate(endDateVal);
  };

  const manageStoreBeforePush = () => {
    const payload = {
      list: customersData as AnyTodo,
      offset,
      organisation,
      filters,
      clientRules,
      dates: state.selectedDatesData,
    };

    dispatch({ type: ActionTypes.CUSTOMERS_LIST, payload });

    return payload;
  };

  const tableColumns: DataColumn<CustomersResponse>[] = [
    {
      title: "Session Key",
      field: "session_key",
    },
    {
      title: "User Id Hash",
      field: "customer_id",
    },
    {
      title: "Transaction ID",
      field: "transaction_id",
    },
    {
      title: "Customer Risk Level",
      field: "customer_risk_level",
      grouping: false,
      render: (rowData: AnyTodo) => <Badge title={rowData.customer_risk_level || "unknown"} />,
    },
    {
      title: "Flow",
      field: "flow",
    },
    {
      title: "Device ID",
      field: "device_id",
    },
    {
      title: "First Name",
      field: "first_name",
    },
    {
      title: "Last Name",
      field: "last_name",
    },
    {
      title: "Email Reason Codes",
      field: "email_reason_codes",
    },
    {
      title: "Phone Reason Codes",
      field: "phone_reason_codes",
    },
    {
      title: "Email Risk Level",
      field: "email_level",
      grouping: false,
      render: (rowData: AnyTodo) => <Badge title={rowData.email_level || "unknown"} />,
    },
    {
      title: "Phone Risk Level",
      field: "phone_level",
      grouping: false,
      render: (rowData: AnyTodo) => <Badge title={rowData.phone_level || "unknown"} />,
    },
    {
      title: "Phone",
      field: "phone",
    },
    {
      title: "Carrier",
      field: "carrier",
    },
    {
      title: "Phone Country",
      field: "phone_country",
    },
    {
      title: "Email",
      field: "email_address",
    },
    {
      title: "Email Verified",
      field: "is_email_verified",
    },
    {
      title: "Phone Verified",
      field: "is_phone_verified",
    },
    {
      title: "Date Of Birth",
      field: "date_of_birth",
      filtering: false,
    },
    {
      title: "Postal Code",
      field: "postal_code",
    },
    {
      title: "City",
      field: "city",
    },
    {
      title: "Region Code",
      field: "region_code",
    },
    {
      title: "Country Code",
      field: "country_code",
    },
  ];

  const prepareFiltersForAPI = (filterList: Array<FilterData>) => {
    const fData: { [key: string]: string } = {};
    filterList.forEach((f) => {
      fData[f.key] = f.value;
    });
    return fData;
  };

  const [isFetchErr, setFetchErr] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      if (clientId === "") {
        return;
      }

      if (useDatastore && dsPageCursor !== "done") {
        const startDateTimestamp = datetimeToTimestamp(startDate, {
          unit: TIME_UNITS.SECOND,
          format: DATE_FORMATS.DATETIME,
          parseTimezone: TIMEZONE_TYPES.LOCAL,
        });

        const endDateTimestamp =
          datetimeToTimestamp(endDate, {
            unit: TIME_UNITS.SECOND,
            format: DATE_FORMATS.DATETIME,
            parseTimezone: TIMEZONE_TYPES.LOCAL,
          }) +
          8 * 60 * 60; // adding 8 hrs on end date to handle date conversion issue

        const { sessions, pageCursor } = await getSessions(
          clientId,
          startDateTimestamp,
          endDateTimestamp,
          prepareFiltersForAPI(filters),
          dsPageCursor === "start" ? null : dsPageCursor,
          30
        );
        setIsDataLoaded(true);
        setIsLoadMore(false);
        if (sessions.length > 0) {
          setCustomersData([...customersData, ...sessions.map((s) => convertDatastoreSessionToCustomerResponse(s))]);
        }
        if (pageCursor) {
          setDSPageCursor(pageCursor);
        } else {
          setDSPageCursor("done");
        }
      } else if (!useDatastore) {
        const { result } = await getCustomers(clientId, {
          startDate,
          endDate,
          offset,
          limit,
          ...prepareFiltersForAPI(filters),
        });

        setIsDataLoaded(true);
        setIsLoadMore(false);
        if (Array(result).length > 0) {
          const response: CustomersResponse[] = result.map((r: AnyTodo) => convertToCustomerResponse(r));
          if (offset === 0) {
            setCustomersData(response);
          } else {
            setCustomersData([...customersData, ...response]);
          }
        }
      } else {
        setIsDataLoaded(true);
        setIsLoadMore(false);
      }
    } catch (err) {
      if (!isErrorWithResponseStatus(err)) {
        throw err;
      }
      setFetchErr(true);
    }
  }, [startDate, endDate, clientId, offset, limit, customersData, filters, useDatastore, dsPageCursor]);

  useEffect(() => {
    if (!isDataLoaded || isLoadMore) {
      fetchData()
        .then()
        .catch((err) => Sentry.captureException(err));
    }
  }, [isDataLoaded, isLoadMore, fetchData]);

  const getAndSetClientId = useCallback(async () => {
    const data = await getClientIdObject(organisation);
    setClientId(data.client_id);
  }, [organisation]);

  useEffect(() => {
    getAndSetClientId()
      .then()
      .catch((err) => Sentry.captureException(err));
  }, [getAndSetClientId]);

  const getRulesList = useCallback(async () => {
    if (clientId === "") {
      return;
    }
    const data = await getRules(clientId, "customer");
    setClientRules(data);
  }, [clientId]);

  useEffect(() => {
    getRulesList()
      .then()
      .catch((err) => Sentry.captureException(err));
  }, [getRulesList]);

  const pushToDetails = (event: AnyTodo, rowData: AnyTodo) => {
    const searchQuery = `client_id=${rowData.client_id}&sessionKey=${encodeURIComponent(
      rowData.session_key
    )}&customerId=${encodeURIComponent(rowData.customer_id)}`;
    const historyState = { data: rowData, payload: manageStoreBeforePush() };

    if (event.metaKey) {
      const url = `${SESSION_DETAILS_PATH}?${searchQuery}`;
      openUrlNewTabWithHistoryState(url, historyState);
      return;
    }

    navigate(
      {
        pathname: SESSION_DETAILS_PATH,
        search: searchQuery,
      },
      {
        state: historyState,
      }
    );
  };

  const copiedToast = () => {
    addToast("Selected text copied!", {
      appearance: "info",
      autoDismiss: true,
    });
  };

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="customers-list" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName data-tid="title_customer_intelligence">Customer Intelligence</StyledTitleName>
            <StyledDropdownDiv style={{ marginRight: "50px" }}>
              {isAdmin ? (
                <div style={{ zIndex: 20 }}>
                  <OrganisationDropDown changeOrganisation={changeOrganisation} organisation={organisation} />
                </div>
              ) : null}
            </StyledDropdownDiv>
          </StyledNavTitle>
        </StyledStickyNav>
        <FilterField
          updateDate={updateDate}
          startDate={startDate}
          endDate={endDate}
          placeholder="Search here"
          filters={filters}
          fields={WHITELISTED_QUERY_FIELDS}
          dividerIndexes={[6, 11]}
          onFiltersUpdate={setFilters}
          onApply={() => {
            navigate(`${CUSTOMERS_PATH}?${constructQueryParams(filters, startDate, endDate, organisation)}`);
            navigate(0); // Refresh the page. TODO: Change the way to update the filter.
          }}
        />
        <TableWrapper>
          <HandleInlineError isError={isFetchErr}>
            <CustomersDataTable
              columns={tableColumns}
              data={customersData}
              title=""
              options={{
                debounceInterval: 1500,
                exportFileName: `customers_data_${startDate}_${endDate}`,
              }}
              onRowClick={(event, rowData) => {
                const selection = window.getSelection()?.toString() || "";
                if (selection.length > 0) {
                  navigator.clipboard.writeText(selection).then(copiedToast, () => {
                    window.clipboardData.setData("Text", selection);
                    copiedToast();
                  });
                } else {
                  pushToDetails(event, rowData);
                }
              }}
              onChangePage={(page: number, pageSize: number) => {
                const totalPages = Math.ceil(customersData.length / pageSize);

                if (totalPages - page - 1 <= 0) {
                  setOffset(offset + limit);
                  setIsLoadMore(true);
                }
              }}
              isLoading={isLoadMore || !isDataLoaded}
              localization={{
                toolbar: {
                  exportCSVName: `Export ${customersData.length} records as CSV`,
                },
              }}
              components={{
                Toolbar: CustomersTableToolbar,
                Cell,
              }}
            />
          </HandleInlineError>
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};

export default Customers;
