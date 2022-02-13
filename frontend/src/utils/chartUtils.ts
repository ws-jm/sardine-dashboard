import {
  CHART_NAMES,
  DeviceSessionRiskLevelBreakdownRow,
  CustomerRiskLevelDistributionRow,
  createFailure,
  createSuccess,
  getFailureResult,
  getSuccessResult,
  isFailure,
  Result,
  SESSION_RISK_LEVELS,
} from "sardine-dashboard-typescript-definitions";
import { fetchDataDistributionChartValues } from "./api";
import { captureException, getErrorMessage } from "./errorUtils";
import { sortDates } from "./timeUtils";

interface DeviceSessionRiskLevelBreakdownRowsList {
  rows: DeviceSessionRiskLevelBreakdownRow[];
}

interface CustomerRiskLevelSessionDistributionRowsList {
  rows: CustomerRiskLevelDistributionRow[];
}

export interface DateRiskExpression {
  [SESSION_RISK_LEVELS.MEDIUM_LOW]?: number;
  [SESSION_RISK_LEVELS.VERY_HIGH]?: number;
  [SESSION_RISK_LEVELS.HIGH]?: number;
  [SESSION_RISK_LEVELS.MEDIUM]?: number;
  [SESSION_RISK_LEVELS.LOW]?: number;
  date?: string;
}

const isDeviceSessionRiskLevelBreakdownRowsList = (data: unknown): data is DeviceSessionRiskLevelBreakdownRowsList =>
  data !== undefined &&
  data !== null &&
  (data as DeviceSessionRiskLevelBreakdownRowsList).rows &&
  Array.isArray((data as DeviceSessionRiskLevelBreakdownRowsList).rows);

const isCustomerRiskLevelSessionDistributionRowsList = (data: unknown): data is CustomerRiskLevelSessionDistributionRowsList =>
  data !== undefined &&
  data !== null &&
  (data as CustomerRiskLevelSessionDistributionRowsList).rows &&
  Array.isArray((data as CustomerRiskLevelSessionDistributionRowsList).rows) &&
  (data as CustomerRiskLevelSessionDistributionRowsList).rows.length > 0;

const transformBQToRiskExpressions = (
  bigQueryResult: CustomerRiskLevelSessionDistributionRowsList | DeviceSessionRiskLevelBreakdownRowsList
) => {
  const dates: {
    [dateString: string]: DateRiskExpression;
  } = {};
  const datesTotal: { [dateString: string]: number } = {};
  bigQueryResult.rows.forEach((row) => {
    const { count } = row;
    const dateString = row.date.value;
    if (dateString in datesTotal) {
      datesTotal[dateString] += count;
    } else {
      datesTotal[dateString] = count;
    }
  });
  bigQueryResult.rows.forEach((row) => {
    const { count } = row;
    const dateString = row.date.value;
    const risk = row.risk_level;
    if (dateString in dates) {
      const d = dates[dateString];
      d[risk] = Math.floor((1000 * count) / datesTotal[dateString]) / 10;
    } else {
      dates[dateString] = { [risk]: Math.floor((1000 * count) / datesTotal[dateString]) / 10, date: dateString };
    }
  });
  const dateRiskList: DateRiskExpression[] = [];
  sortDates(Object.keys(dates)).forEach((date) => {
    dateRiskList.push(dates[date]);
  });
  return dateRiskList;
};

export const loadDeviceSessionRiskLevelBreakdown = async (orgName: string): Promise<Result<DateRiskExpression[]>> => {
  try {
    const result = await fetchDataDistributionChartValues({
      chartName: CHART_NAMES.DEVICE_SESSION_RISK_LEVEL_BREAKDOWN,
      organisation: orgName,
      typeGuard: isDeviceSessionRiskLevelBreakdownRowsList,
    });
    if (isFailure(result)) {
      return result;
    }
    const bigQueryResult = getSuccessResult(result);

    const value = transformBQToRiskExpressions(bigQueryResult);
    return createSuccess(value);
  } catch (e) {
    captureException(e);
    const message = getErrorMessage(e);
    return createFailure(new Error(message));
  }
};

const loadCustomerRiskLevel = async (func: () => Promise<Result<CustomerRiskLevelSessionDistributionRowsList>>) => {
  try {
    const result = await func();
    if (isFailure(result)) {
      return {
        error: getFailureResult(result),
      };
    }
    const bigQueryResult = getSuccessResult(result);
    const value = transformBQToRiskExpressions(bigQueryResult);

    return createSuccess(value);
  } catch (e) {
    captureException(e);
    const message = getErrorMessage(e);
    return createFailure(new Error(message));
  }
};

export const loadCustomerRiskLevelSessionDistribution = async (orgName: string): Promise<Result<DateRiskExpression[]>> => {
  const result = await loadCustomerRiskLevel(async () => {
    const res = await fetchDataDistributionChartValues({
      organisation: orgName,
      chartName: CHART_NAMES.CUSTOMER_RISK_LEVEL_SESSION_DISTRIBUTION,
      typeGuard: isCustomerRiskLevelSessionDistributionRowsList,
    });
    return res;
  });
  return result;
};

export const loadCustomerEmailRiskLevelDistribution = async (orgName: string): Promise<Result<DateRiskExpression[]>> => {
  const result = await loadCustomerRiskLevel(async () => {
    const res = await fetchDataDistributionChartValues({
      organisation: orgName,
      chartName: CHART_NAMES.CUSTOMER_EMAIL_RISK_LEVEL_DISTRIBUTION,
      typeGuard: isCustomerRiskLevelSessionDistributionRowsList,
    });
    return res;
  });
  return result;
};
