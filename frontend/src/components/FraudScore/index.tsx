import { useContext, useEffect, useState, useCallback } from "react";
import { LatLngExpression } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import moment from "moment";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { isErrorWithResponseStatus } from "utils/errorUtils";
import { replaceAllUnderscoresWithSpaces } from "utils/stringUtils";
import * as Sentry from "@sentry/react";
import {
  AnyTodo,
  DATA_SOURCE,
  DeviceProfile,
  DEVICE_WHITELISTED_FILTERS,
  SOURCE_QUERY_FIELD,
} from "sardine-dashboard-typescript-definitions";
import { useCookies } from "react-cookie";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "store/user";
import { getClientFromQueryParams } from "utils/getClientFromQueryParams";
import { datetimeToTimestamp } from "utils/timeUtils";
import Layout from "../Layout/Main";
import { StoreCtx } from "../../utils/store";
import OrganisationDropDown from "../Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import Map from "../Maps";
import { LayerContextProvider } from "../Maps/LayerContext";
import { ActionTypes } from "../../utils/store/actionTypes";
import { DatesProps } from "../../utils/store/interface";
import { fetchDeviceDetails } from "../../utils/api";
import { DataColumn, DataTable, ToolBarWithTitle } from "../Common/DataTable";
import { StyledMainDiv, TableWrapper } from "./styles";
import FilterField, { FilterData, getFilters } from "../Common/FilterField";
import Badge from "../Common/Badge";
import { FRAUD_SCORE_PATH, DEVICE_VIEW_PATH } from "../../modulePaths";
import { openUrlNewTabWithHistoryState } from "../../utils/openUrlNewTabWithHistoryState";
import { TIME_UNITS, DATE_FORMATS, TIMEZONE_TYPES } from "../../constants";

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
function constructQueryParams(
  dataFilters: Array<FilterData>,
  startDate: string,
  endDate: string,
  client: string,
  source: string
): string {
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
  params[SOURCE_QUERY_FIELD] = source;
  return new URLSearchParams(params).toString();
}

function getDatesFromQueryParams(pathSearch: string): DatesProps {
  const searchParams = new URLSearchParams(pathSearch);
  const startDate = searchParams.get(START_DATE_QUERY_FIELD) || getDefaultStartDate();
  const endDate = searchParams.get(END_DATE_QUERY_FIELD) || getDefaultEndDate();

  return { startDate, endDate, selectedDateIndex: 3 };
}

export function getSourceFromQueryParams(pathSearch: string, isSuperAdmin: boolean): string {
  const searchParams = new URLSearchParams(pathSearch);
  return searchParams.get(SOURCE_QUERY_FIELD) || (isSuperAdmin ? DATA_SOURCE.DATASTORE : DATA_SOURCE.ELASTIC_SEARCH);
}

const FraudScore = () => {
  const limit = 100;
  const { state, dispatch } = useContext(StoreCtx);
  const navigate = useNavigate();

  const [deviceData, setDeviceData] = useState<DeviceProfile[]>([]);
  const [userId, setUserId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [offset, setOffset] = useState(0);

  const { addToast } = useToasts();

  const { isSuperAdmin, isAdmin, userOrganization } = useUserStore((state: AnyTodo) => ({
    userOrganization: state.organisation,
    isSuperAdmin: selectIsSuperAdmin(state),
    isAdmin: selectIsAdmin(state),
  }));

  const { search } = useLocation();
  const [filters, setFilters] = useState(getFilters(search, DEVICE_WHITELISTED_FILTERS));
  const dbSource = getSourceFromQueryParams(search, isSuperAdmin);

  const dates = getDatesFromQueryParams(search);
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);

  const [cookies] = useCookies(["organization"]);

  const organisation =
    cookies.organization || (isSuperAdmin ? getClientFromQueryParams(search, isAdmin, userOrganization) : userOrganization);

  const changeOrganisation = (org: string) => {
    navigate(`${FRAUD_SCORE_PATH}?${constructQueryParams(filters, startDate, endDate, org, dbSource)}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const updateDate = (index: number, dateData: DatesProps) => {
    setStartDate(dateData.startDate);
    setEndDate(dateData.endDate);
  };

  const manageStoreBeforePush = () => {
    const payload = {
      list: deviceData as AnyTodo,
      offset,
      organisation,
      deviceId,
      userId,
      filters,
      dates: state.selectedDatesData,
    };

    dispatch({ type: ActionTypes.FRAUD_SCORE_LIST, payload });

    return payload;
  };

  const tableColumns: DataColumn<AnyTodo>[] = [
    {
      title: "Session Key",
      field: "session_key",
    },
    {
      title: "User Id Hash",
      field: "user_id_hash",
    },
    {
      title: "Device Id",
      field: "device_id",
    },
    {
      title: "Session Risk",
      field: "session_risk",
      grouping: false,
      render: (rowData: DeviceProfile) => <Badge title={rowData.session_risk || "unknown"} />,
    },
    {
      title: "Device Reputation",
      field: "device_reputation",
      grouping: false,
      render: (rowData: DeviceProfile) => <Badge title={rowData.device_reputation || "unknown"} />,
    },
    {
      title: "Browser",
      field: "browser",
    },
    {
      title: "OS",
      field: "os",
    },
    {
      title: "Date Time",
      field: "datetime",
    },

    {
      title: "Remote Software",
      field: "remote_software",
    },
    {
      title: "IP Address",
      field: "ip_address",
    },
    {
      title: "IP Type",
      field: "ip_type",
    },
    {
      title: "Screen Resolution",
      field: "screen_resolution",
    },
    {
      title: "Proxy",
      field: "proxy",
    },
    {
      title: "Emulator",
      field: "emulator",
    },
    {
      title: "VPN",
      field: "vpn",
    },
    {
      title: "Fingerprint Id",
      field: "fingerprint_id",
    },
    {
      title: "Confidence Score",
      field: "confidence_score",
    },
    {
      title: "VPN Heuristic",
      field: "vpn_heuristic",
    },
    {
      title: "Location",
      field: "location",
      render: (rowData: DeviceProfile) => <div>{JSON.stringify(rowData.location || {})}</div>,
    },
    {
      title: "Country",
      field: "country",
    },
    {
      title: "Device Memory",
      field: "device_memory",
    },
    {
      title: "City",
      field: "city",
    },
    {
      title: "Created At",
      field: "created_at",
    },
    {
      title: "True Os",
      field: "true_os",
    },
    {
      title: "OS Anomaly",
      field: "os_anomaly",
    },
  ];

  const prepareFiltersForAPI = (filterList: FilterData[]) => {
    const fData: { [key: string]: string } = {};
    filterList.forEach((f) => {
      fData[f.key] = f.value;
    });
    return fData;
  };

  const [isFetchErr, setFetchErr] = useState(false);
  const fetchData = useCallback(async () => {
    const startTimestampSeconds = datetimeToTimestamp(startDate, {
      unit: TIME_UNITS.SECOND,
      format: DATE_FORMATS.DATETIME,
      parseTimezone: TIMEZONE_TYPES.LOCAL,
    });

    const endTimestampSeconds =
      datetimeToTimestamp(endDate, {
        unit: TIME_UNITS.SECOND,
        format: DATE_FORMATS.DATETIME,
        parseTimezone: TIMEZONE_TYPES.LOCAL,
      }) +
      8 * 60 * 60;

    try {
      const { result } = await fetchDeviceDetails({
        startTimestampSeconds,
        endTimestampSeconds,
        organisation,
        source: dbSource,
        offset,
        limit,
        filters: prepareFiltersForAPI(filters),
      });

      setIsDataLoaded(true);
      setIsLoadMore(false);

      if (Array.isArray(result)) {
        setIsLastPage(result.length === 0);
        if (offset === 0) {
          setDeviceData(result);
        } else {
          setDeviceData(deviceData.concat(result));
        }
      } else if (result.hits && Array.isArray(result.hits.hits)) {
        const res = result.hits.hits.map((item: AnyTodo) => item._source);
        setIsLastPage(res === 0);
        if (offset === 0) {
          setDeviceData(res);
        } else {
          setDeviceData(deviceData.concat(res));
        }
      }
    } catch (error) {
      setIsDataLoaded(true);
      setIsLoadMore(false);
      if (!isErrorWithResponseStatus(error)) throw error;
      setFetchErr(true);
    }
  }, [startDate, endDate, organisation, deviceId, offset, limit, deviceData, filters]);

  useEffect(() => {
    if (!isDataLoaded || isLoadMore) {
      const fraudScore = state.fraudScoreList;
      if (fraudScore.list.length > 0) {
        setIsDataLoaded(true);
        setIsLoadMore(false);
        setOffset(fraudScore.offset);
        setDeviceId(fraudScore.deviceId);
        setUserId(fraudScore.userId);
        setDeviceData(fraudScore.list as AnyTodo);
      } else {
        fetchData()
          .then()
          .catch((err) => Sentry.captureException(err));
      }
    }
  }, [isDataLoaded, isLoadMore, deviceData]);

  const prepareMarkerInfo = (data: { [key: string]: AnyTodo }) => {
    const keysToCover = tableColumns.map((c) => c.field);
    const info: string[] = [];
    const { session_key, session_risk, city } = data;
    const markerData = {
      session_key,
      session_risk,
      city,
    };

    Object.keys(markerData).forEach((key) => {
      if (keysToCover.includes(key)) {
        const k = replaceAllUnderscoresWithSpaces(key);
        const value = data[key];
        if (value) {
          info.push(`${k}: ${value}`);
        }
      }
    });

    return info.join("\n");
  };

  const getMapData = () =>
    deviceData.length === 0
      ? []
      : deviceData.map((data) => ({
          position: [data.location?.lat || 0, data.location?.lon || 0] as LatLngExpression,
          details: prepareMarkerInfo(data),
        }));

  const pushToDetails = (event: AnyTodo, rowData: AnyTodo) => {
    const pathSearch = `session=${encodeURIComponent(
      rowData.session_key
    )}&${SOURCE_QUERY_FIELD}=${dbSource}&${CLIENT_QUERY_FIELD}=${organisation}`;
    const historyState = { data: rowData, payload: manageStoreBeforePush() };

    if (event.metaKey) {
      const url = `${DEVICE_VIEW_PATH}?${pathSearch}`;
      openUrlNewTabWithHistoryState(url, historyState);
      return;
    }

    navigate({
      pathname: DEVICE_VIEW_PATH,
      search: pathSearch,
    });
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
        <StyledStickyNav id="device-info" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName data-tid="title_device_intelligence">Device Intelligence</StyledTitleName>
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
          fields={tableColumns.map((t) => t.field?.toString() || "")}
          dividerIndex={4}
          onFiltersUpdate={setFilters}
          onApply={() => {
            navigate(`${FRAUD_SCORE_PATH}?${constructQueryParams(filters, startDate, endDate, organisation, dbSource)}`);
            navigate(0); // Refresh the page. TODO: Change the way to update the filter.
          }}
        />
        <LayerContextProvider>
          <Map
            markers={getMapData()}
            viewMoreAction={(index) => {
              navigate(
                {
                  pathname: "device-view",
                  search: `session=${encodeURIComponent((deviceData[index] as AnyTodo).session_key)}&userId=${encodeURIComponent(
                    (deviceData[index] as AnyTodo).user_id_hash
                  )}`,
                },
                {
                  state: {
                    data: deviceData[index],
                    payload: manageStoreBeforePush(),
                  },
                }
              );
            }}
          />
        </LayerContextProvider>
        <TableWrapper>
          <HandleInlineError isError={isFetchErr}>
            <DataTable
              columns={tableColumns}
              data={deviceData}
              isLoading={isLoadMore || !isDataLoaded}
              title=""
              options={{
                debounceInterval: 1500,
                exportFileName: `devices_data_${startDate}_${endDate}`,
              }}
              onRowClick={(event: AnyTodo, rowData: AnyTodo) => {
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
                const totalPages = Math.floor(deviceData.length / pageSize);
                if (totalPages - page - 1 <= 0 && !isLastPage) {
                  setOffset(offset + limit);
                  setIsLoadMore(true);
                }
              }}
              localization={{
                toolbar: {
                  exportCSVName: `Export ${deviceData.length} records as CSV`,
                },
              }}
              components={{
                Toolbar: ({ data: tableData }: { data: AnyTodo }) => (
                  <ToolBarWithTitle title="Device Sessions History" data={tableData} />
                ),
              }}
            />
          </HandleInlineError>
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};

export default FraudScore;
