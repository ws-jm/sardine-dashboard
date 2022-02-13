import React, { createContext, useReducer, Dispatch } from "react";
import moment from "moment";
import { INITIAL_STATE_USER } from "./storeConstants";
import { StoreProps } from "./interface";
import { userReducer, UserActions } from "./reducers";

const initialState = {
  user: INITIAL_STATE_USER,
  path: {
    field: "all",
    title: "Device Intelligence",
  },
  selectedDatesData: {
    startDate: moment().subtract({ days: 1 }).utc().format("YYYY-MM-DD HH:mm:ss"),
    endDate: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
    selectedDateIndex: 0,
  },
  ruleList: {
    rules: [],
  },
  blockAllowList: {
    blocklist: [],
    allowlist: [],
    selectedTab: "",
    organisation: "",
    strSearch: "",
    fieldType: "",
    shouldRefresh: false,
  },
  fraudScoreList: {
    list: [],
    offset: 0,
    organisation: "",
    deviceId: "",
    userId: "",
    filters: [],
    dates: {
      startDate: moment().subtract({ days: 1 }).format("L"),
      endDate: moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      selectedDateIndex: 0,
    },
  },
  ruleData: {
    organisation: "",
    checkpoint: "",
  },
  customersList: {
    list: [],
    offset: 0,
    organisation: "",
    filters: [],
    dates: {
      startDate: moment().subtract({ days: 1 }).format("L"),
      endDate: moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      selectedDateIndex: 0,
    },
  },
  queuesList: {
    list: [],
    organisation: "",
    strSearch: "",
    checkpoint: "",
  },
  queuesSessionList: {
    list: [],
    strSearch: "",
  },
};

const StoreCtx = createContext<{
  state: StoreProps;
  dispatch: Dispatch<UserActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = (defaultState: StoreProps, action: UserActions) => userReducer(defaultState, action);

const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>;
};

export { StateProvider, StoreCtx };
