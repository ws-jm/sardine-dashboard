import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { isErrorWithResponseStatus } from "utils/errorUtils";
import { Transaction, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { PAYMENT_METHOD_DETAILS_PATH, TRANSACTIONS_PATH, TRANSACTION_DETAILS_PATH } from "modulePaths";
import * as Sentry from "@sentry/react";
import { useCookies } from "react-cookie";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import OrganisationDropDown from "../Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import { DatesProps } from "../../utils/store/interface";
import { fetchTransactionsData } from "../../utils/api";
import { DataTable, DataColumn, ToolBarWithTitle } from "../Common/DataTable";
import { StyledMainDiv, TableWrapper, LinkValue } from "./styles";
import FilterField, { FilterData, getFilters } from "../Common/FilterField";
import { openUrlNewTabWithHistoryState } from "../../utils/openUrlNewTabWithHistoryState";
import Badge from "../Common/Badge";

const WHITELISTED_QUERY_FIELDS = [
  "customer_id",
  "session_key",
  "transaction_id",
  "action_type",
  "item_category",
  "card_hash",
  "account_number",
  "crypto_address",
] as const;

export const START_DATE_QUERY_FIELD = "start_date";
export const END_DATE_QUERY_FIELD = "end_date";
export const CLIENT_QUERY_FIELD = "client";

export function getDefaultStartDate(day = 1): string {
  return moment().subtract({ days: day }).utc().format("YYYY-MM-DD HH:mm:ss");
}

export function getDefaultEndDate(): string {
  return moment().utc().format("YYYY-MM-DD HH:mm:ss");
}

// Construct query params from filters
export function constructQueryParams(dataFilters: Array<FilterData>, startDate: string, endDate: string, client: string): string {
  const params: { [key: string]: string } = {};
  dataFilters.forEach((filter) => {
    if (filter.apply) {
      params[filter.key] = filter.value;
    }
  });

  const start = startDate || getDefaultStartDate();
  const end = endDate || getDefaultEndDate();
  params[START_DATE_QUERY_FIELD] = start;
  params[END_DATE_QUERY_FIELD] = end;
  params[CLIENT_QUERY_FIELD] = client;
  return new URLSearchParams(params).toString();
}

export function getDatesFromQueryParams(pathSearch: string): DatesProps {
  const searchParams = new URLSearchParams(pathSearch);
  const startDate = searchParams.get(START_DATE_QUERY_FIELD) || getDefaultStartDate();
  const endDate = searchParams.get(END_DATE_QUERY_FIELD) || getDefaultEndDate();

  return { startDate, endDate, selectedDateIndex: 3 };
}

function getClientFromQueryParams(pathSearch: string): string {
  const searchParams = new URLSearchParams(pathSearch);
  return searchParams.get(CLIENT_QUERY_FIELD) || "all";
}

const Transactions: React.FC = () => {
  const navigate = useNavigate();

  const [cookies] = useCookies(["organization"]);

  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLastPage, setIsLastPage] = useState(true);

  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, WHITELISTED_QUERY_FIELDS));

  const dates = getDatesFromQueryParams(search);
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);

  const { isAdmin, userOrganisation } = useUserStore((state: AnyTodo) => ({
    isAdmin: selectIsAdmin(state),
    userOrganisation: state.organisation,
  }));
  const organisation = cookies.organization || (isAdmin ? getClientFromQueryParams(search) : userOrganisation);

  const changeOrganisation = (org: string) => {
    navigate(`${TRANSACTIONS_PATH}?${constructQueryParams(filters, startDate, endDate, org)}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const updateDate = (index: number, dateData: DatesProps) => {
    setStartDate(dateData.startDate);
    setEndDate(dateData.endDate);
  };

  const pushToDetails = (metaKey: boolean, rowData: Transaction, isTransaction: boolean) => {
    const pathSearch = `clientId=${encodeURIComponent(rowData.client_id)}&transactionId=${encodeURIComponent(
      rowData.id
    )}&client=${encodeURIComponent(organisation)}`;
    const historyState = { data: rowData };

    const pathName = isTransaction ? TRANSACTION_DETAILS_PATH : PAYMENT_METHOD_DETAILS_PATH;
    if (metaKey) {
      const url = `${pathName}?${pathSearch}`;
      openUrlNewTabWithHistoryState(url, historyState);
      return;
    }

    navigate({
      pathname: pathName,
      search: pathSearch,
    });
  };

  const tableColumns: DataColumn<AnyTodo>[] = [
    {
      title: "Customer Id",
      field: "customer_id",
      render: (rowData: AnyTodo) => (
        <LinkValue onClick={(event) => pushToDetails(event.metaKey, rowData, false)}>{rowData.customer_id || "-"}</LinkValue>
      ),
    },
    {
      title: "Transaction Id",
      field: "id",
      render: (rowData: AnyTodo) => (
        <LinkValue onClick={(event) => pushToDetails(event.metaKey, rowData, true)}>{rowData.id || "-"}</LinkValue>
      ),
    },
    {
      title: "Date & Time",
      field: "created_milli",
      render: (rowData: AnyTodo) => <div>{moment(rowData.created_milli).format("LLL")}</div>,
    },
    {
      title: "Amount",
      field: "amount",
    },
    {
      title: "Session Key",
      field: "session_key",
    },
    {
      title: "Risk Level",
      field: "risk_level",
      render: (rowData: AnyTodo) => <Badge title={rowData.risk_level || "unknown"} />,
    },
    {
      title: "AML Level",
      field: "aml_level",
      render: (rowData: AnyTodo) => <Badge title={rowData.aml_level || "unknown"} />,
    },
    {
      title: "Category",
      field: "item_category",
    },
    {
      title: "Action Type",
      field: "action_type",
    },
    {
      title: "Card Hash",
      field: "card_hash",
    },
    {
      title: "Account Number",
      field: "account_number",
    },
    {
      title: "Crypto Address",
      field: "crypto_address",
    },
  ];

  const [isFetchErr, setFetchErr] = useState(false);
  const fetchData = useCallback(async () => {
    if (!organisation || organisation === "all") {
      setIsDataLoaded(true);
      return;
    }

    const fData: { [key: string]: string } = {};
    filters.forEach((f) => {
      if (f.currently_applied) {
        fData[f.key] = f.value;
      }
    });

    try {
      const { transactions, islast } = await fetchTransactionsData(organisation, {
        startDate,
        endDate,
        offset: isLastPage ? 0 : transactionsData.length,
        ...fData,
      });

      setIsDataLoaded(true);
      setIsLastPage(islast);
      setTransactionsData(transactionsData.concat(transactions));
    } catch (error) {
      setIsDataLoaded(true);
      if (!isErrorWithResponseStatus(error)) throw error;
      setFetchErr(true);
    }
  }, [startDate, endDate, organisation, transactionsData, filters]);

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData()
        .then()
        .catch((e) => Sentry.captureException(e));
    }
  }, [isDataLoaded]);

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="transaction-info" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName> Transaction Intelligence</StyledTitleName>
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
          onFiltersUpdate={setFilters}
          onApply={() => {
            navigate(`${TRANSACTIONS_PATH}?${constructQueryParams(filters, startDate, endDate, organisation)}`);
            navigate(0); // Refresh the page. TODO: Change the way to update the filter.
          }}
        />
        <TableWrapper>
          <HandleInlineError isError={isFetchErr}>
            <DataTable
              columns={tableColumns}
              data={transactionsData}
              isLoading={!isDataLoaded}
              title=""
              options={{
                debounceInterval: 1500,
                exportFileName: `transactions_data_${startDate}_${endDate}`,
              }}
              onChangePage={(page: number, pageSize: number) => {
                const totalPages = Math.floor(transactionsData.length / pageSize);
                if (totalPages - page - 1 <= 0 && !isLastPage) {
                  setIsDataLoaded(false);
                }
              }}
              localization={{
                toolbar: {
                  exportCSVName: `Export ${transactionsData.length} records as CSV`,
                },
              }}
              components={{
                Toolbar: ({ data }: { data: AnyTodo }) => <ToolBarWithTitle title="Transactions History" data={data} />,
              }}
            />
          </HandleInlineError>
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};

export default Transactions;
