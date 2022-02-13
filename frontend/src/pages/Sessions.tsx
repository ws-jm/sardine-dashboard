import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FormControl, Button, Pagination } from "react-bootstrap";
import { AnyTodo, CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { ErrorText } from "components/RulesModule/styles";
import LoadingText from "components/Common/LoadingText";
import { captureException } from "utils/errorUtils";
import FilterField, { FilterData, getFilters } from "components/Common/FilterField";
import moment from "moment";
import { END_DATE_QUERY_FIELD, getDatesFromQueryParams, START_DATE_QUERY_FIELD } from "components/Transactions";
import { DatesProps } from "utils/store/interface";
import { SESSIONS_PATH, SESSION_DETAILS_PATH } from "modulePaths";
import Layout from "../components/Layout/Main";
import { StoreCtx } from "../utils/store";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import { ActionTypes } from "../utils/store/actionTypes";
import {
  StyledMainDiv,
  StyledTable,
  BackgroundBox,
  StyledTh,
  StyledContainer,
  HorizontalContainer,
  HorizontalSpace,
  StyledUl,
} from "../components/Queues/styles";
import { Queue } from "../components/Queues/Components/Queue";
import back_blue from "../utils/logo/back_blue.svg";
import search_icon from "../utils/logo/search_light.svg";
import ActionPopup from "../components/Queues/Components/ActionPopup";
import { getSessionslist } from "../utils/api";
import { convertToCustomerResponse } from "./Customers";

const searchFields = ["session_key", "customer_id", "status"];

export const headers = ["Session Key", "Customer ID", "Date", "Owner", "Status"];
const MAX_SELECTION_COUNT = 5;
const LIMIT = 15;
const LOADER_HEIGHT = 200;

// Construct query params from filters
function constructFiltersQueryParams(
  dataFilters: Array<FilterData>,
  queueID: string,
  queueName: string,
  clientId: string,
  org: string,
  startDate: string,
  endDate: string
): string {
  const params: { [key: string]: string } = {};

  for (let i = 0; i < dataFilters.length; i += 1) {
    const filter = dataFilters[i];
    if (filter.apply) {
      params[filter.key] = filter.value;
    }
  }

  params.queueID = queueID;
  params.name = queueName;
  params.client_id = clientId;
  params.org = org;

  params[START_DATE_QUERY_FIELD] = startDate;
  params[END_DATE_QUERY_FIELD] = endDate;
  return new URLSearchParams(params).toString();
}

const prepareFiltersForAPI = (filterList: Array<FilterData>) => {
  const fData: { [key: string]: string } = {};
  filterList.forEach((f) => {
    fData[f.key] = f.value;
  });
  return fData;
};

const loadingStyle: React.CSSProperties = {
  height: LOADER_HEIGHT,
  color: "var(--dark-14)",
  alignItems: "center",
  justifyContent: "center",
  display: "flex",
};

const DataList = ({
  checkpoint,
  clientId,
  dataHolder,
  isLastPage,
  isLoading,
  queuesData,
  queueName,
  offset,
  org,
  selectedSessions,
  searchString,
  setOffset,
  setSelectedSessions,
}: {
  checkpoint: string;
  clientId: string;
  dataHolder: CustomersResponse[];
  isLastPage: boolean;
  isLoading: boolean;
  queuesData: CustomersResponse[];
  queueName: string;
  offset: number;
  org: string;
  selectedSessions: string[];
  searchString: string;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  setSelectedSessions: React.Dispatch<React.SetStateAction<string[]>>;
}): JSX.Element => {
  const { dispatch } = useContext(StoreCtx);
  const navigate = useNavigate();
  const manageStoreBeforePush = () => {
    const payload = {
      list: dataHolder,
      strSearch: searchString,
    };

    dispatch({ type: ActionTypes.QUEUES_SESSION_LIST, payload });
    return payload;
  };

  return (
    <>
      <StyledTable>
        <thead style={{ height: 50 }}>
          <tr>
            <StyledTh key={-1} />
            {headers.map((ele) => (
              <StyledTh key={ele}>{ele}</StyledTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingText style={loadingStyle} />
          ) : (
            queuesData.slice(offset, offset + LIMIT).map((d, index) => (
              <Queue
                key={index.toString()}
                sessionData={d}
                isSelection={selectedSessions.includes(d.session_key)}
                isCheckActive={selectedSessions.length < MAX_SELECTION_COUNT || selectedSessions.includes(d.session_key)}
                onChecked={() => {
                  if (selectedSessions.includes(d.session_key)) {
                    setSelectedSessions(selectedSessions.filter((s) => s !== d.session_key));
                  } else {
                    setSelectedSessions([...selectedSessions, d.session_key]);
                  }
                }}
                onClick={() => {
                  navigate(
                    `${SESSION_DETAILS_PATH}?sessionKey=${encodeURIComponent(
                      d.session_key || ""
                    )}&customerId=${encodeURIComponent(d.customer_id || "")}&client_id=${clientId}&org=${encodeURIComponent(
                      org
                    )}&queue=${encodeURIComponent(queueName)}&checkpoint=${encodeURIComponent(checkpoint)}`,
                    {
                      state: {
                        data: d,
                        list: manageStoreBeforePush(),
                      },
                    }
                  );
                }}
              />
            ))
          )}
        </tbody>
      </StyledTable>
      <StyledUl style={{ justifyContent: "flex-end" }}>
        <Pagination>
          <Pagination.Prev disabled={offset <= 0} onClick={() => setOffset(offset - LIMIT)} />
          <StyledTitleName style={{ fontSize: 14, fontWeight: "normal", padding: "0px 10px" }}>{`Page ${
            offset > 0 ? offset / LIMIT + 1 : 1
          }`}</StyledTitleName>
          <Pagination.Next
            disabled={isLastPage && offset + LIMIT >= dataHolder.length}
            onClick={() => setOffset(offset + LIMIT)}
          />
        </Pagination>
      </StyledUl>
    </>
  );
};

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queueID = params.get("queueID") || "";
  const queueName = params.get("name") || "-";
  const org = params.get("org") || "-";
  const clientId = params.get("client_id") || "";
  const checkpoint = params.get("checkpoint") || "customer";

  const [queuesData, setQueuesData] = useState<CustomersResponse[]>([]);
  const [dataHolder, setDataHolder] = useState<CustomersResponse[]>([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [offset, setOffset] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [isLastPage, setIsLastPage] = useState(true);

  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, searchFields));
  const dates = getDatesFromQueryParams(search);
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);

  const [pageCursor, setPageCursor] = useState("start");

  const updateDate = (index: number, dateData: DatesProps) => {
    const { startDate: startDateVal, endDate: endDateVal } = dateData;
    setStartDate(startDateVal);
    setEndDate(endDateVal);
  };

  const loadData = useCallback(
    async (page_offset: number = offset) => {
      try {
        setIsLoading(true);

        const startDateTimestamp: number = moment(startDate, "YYYY-MM-DD HH:mm:ss").unix();
        const endDateTimestamp: number = moment(endDate, "YYYY-MM-DD HH:mm:ss").unix() + 8 * 60 * 60;
        // TODO: Use react-query for caching.
        const { list, isLast, newPageCursor } = await getSessionslist(
          queueID,
          pageCursor,
          org,
          LIMIT.toString(),
          startDateTimestamp,
          endDateTimestamp,
          prepareFiltersForAPI(filters)
        );
        setIsLastPage(isLast);
        if (!isLast) {
          setPageCursor(newPageCursor);
        } else {
          setPageCursor("start");
        }
        setIsLoading(false);
        const data = list.map((s: AnyTodo) => convertToCustomerResponse(s));
        if (page_offset === 0) {
          setDataHolder(data);
          setQueuesData(data);
        } else {
          setDataHolder([...dataHolder, ...data]);
          setQueuesData([...queuesData, ...data]);
        }
      } catch (error) {
        captureException(error);
      }
    },
    [queueID, offset, org, queuesData, dataHolder]
  );

  useEffect(() => {
    if (!isDataLoaded) {
      setIsDataLoaded(true);
      setIsLoading(false);
      loadData().then().catch(captureException);
    }
  }, [isDataLoaded, loadData]);

  useEffect(() => {
    if (offset >= dataHolder.length && !isLastPage) {
      loadData().then().catch(captureException);
    }
  }, [offset, loadData, dataHolder, isLastPage]);

  const updateFilters = () => {
    navigate(`${SESSIONS_PATH}?${constructFiltersQueryParams(filters, queueID, queueName, clientId, org, startDate, endDate)}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  return (
    <Layout>
      <ActionPopup
        show={showActionPopup}
        data={queuesData.filter((q) => selectedSessions.includes(q.session_key))}
        checkpoint={checkpoint}
        queueName={queueName}
        handleClose={() => {
          setShowActionPopup(false);
        }}
        handleSuccess={() => {
          setOffset(0);
          setSelectedSessions([]);
          loadData(0).then().catch(captureException);
          setShowActionPopup(false);
        }}
      />
      <StyledStickyNav style={{ width: "100%", marginBottom: 0, backgroundColor: "white" }}>
        <HorizontalContainer
          style={{
            padding: 20,
          }}
        >
          <HorizontalContainer
            style={{
              color: "#2173FF",
              fontSize: 16,
              width: 120,
            }}
            onClick={() => navigate(`/queues?organization=${org}&checkpoint=${checkpoint}`)}
          >
            <img alt="back" src={back_blue} style={{ width: 20, marginLeft: 30 }} />
            Back
          </HorizontalContainer>
          <img alt="search" src={search_icon} style={{ width: 30, marginLeft: 30 }} />
          <FormControl
            type="text"
            placeholder="Search here"
            value={searchString}
            style={{
              marginRight: 20,
              height: 40,
              border: "none",
            }}
            onChange={(event) => {
              const text = event.target.value;
              setSearchString(text);
              if (text.length > 0) {
                const t = text.toLowerCase();
                setQueuesData(
                  dataHolder.filter(
                    (d) =>
                      d.session_key?.toLowerCase().includes(t) ||
                      d.customer_id?.toLowerCase().includes(t) ||
                      d.owner?.name?.toLowerCase().includes(t) ||
                      d.status?.toLowerCase().includes(t)
                  )
                );
                setOffset(0);
              } else {
                setQueuesData(dataHolder);
              }
            }}
          />
          <Button
            style={{
              width: 110,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#2173FF",
              border: "none",
            }}
            disabled={selectedSessions.length === 0}
            onClick={() => {
              setShowActionPopup(true);
            }}
          >
            {" "}
            Actions{" "}
          </Button>
        </HorizontalContainer>
      </StyledStickyNav>

      <StyledMainDiv
        style={{
          height: "100vh",
          backgroundColor: "#FFF",
          width: "100%",
          margin: 0,
          overflowY: "scroll",
        }}
      >
        <StyledNavTitle style={{ width: "100%", marginLeft: 30 }}>
          <StyledTitleName style={{ fontSize: 32, fontWeight: "normal", paddingTop: 20 }}>
            {queueName}
            <StyledTitleName
              style={{
                fontSize: 14,
                fontWeight: "normal",
                color: "#B9C5E0",
                marginTop: 10,
              }}
            >
              Sessions list from rules execution
            </StyledTitleName>
            {selectedSessions.length >= MAX_SELECTION_COUNT ? (
              <ErrorText>You can modify max 5 sessions at a time</ErrorText>
            ) : null}
          </StyledTitleName>
        </StyledNavTitle>
        <FilterField
          className="w-100"
          placeholder="Search here"
          startDate={startDate}
          endDate={endDate}
          filters={filters}
          fields={searchFields}
          containerStyle={{ padding: 30, paddingBottom: 0 }}
          onFiltersUpdate={setFilters}
          onApply={updateFilters}
          updateDate={updateDate}
        />

        <StyledContainer>
          <BackgroundBox>
            {queuesData.length > 0 && (!isLoading || offset > 0) ? (
              <DataList
                checkpoint={checkpoint}
                clientId={clientId}
                dataHolder={dataHolder}
                isLastPage={isLastPage}
                isLoading={isLoading}
                queuesData={queuesData}
                queueName={queueName}
                offset={offset}
                org={org}
                selectedSessions={selectedSessions}
                searchString={searchString}
                setOffset={setOffset}
                setSelectedSessions={setSelectedSessions}
              />
            ) : (
              <LoadingText title={isLoading ? "Loading Records..." : "No records available!"} style={loadingStyle} />
            )}
          </BackgroundBox>
          <HorizontalSpace style={{ marginTop: 50 }} />
        </StyledContainer>
      </StyledMainDiv>
    </Layout>
  );
};

export default Sessions;
