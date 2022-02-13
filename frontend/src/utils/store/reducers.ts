import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { ActionTypes } from "./actionTypes";
import { DatesProps, StoreProps } from "./interface";
import { BlocklistProps } from "../../components/BlockAllowList/RowItem";

type ActionMap<M extends { [index: string]: AnyTodo }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

type UserActionPayload = {
  [ActionTypes.CHANGE_SELECTED_DATES_DATA]: {
    startDate: string;
    endDate: string;
    selectedDateIndex: number;
  };

  [ActionTypes.CHANGE_PATH]: {
    field: string;
    title: string;
  };

  [ActionTypes.BLOCK_LIST]: {
    blocklist: BlocklistProps[];
    allowlist: BlocklistProps[];
    selectedTab: string;
    organisation: string;
    strSearch: string;
    fieldType: string;
    shouldRefresh: boolean;
  };

  [ActionTypes.FRAUD_SCORE_LIST]: {
    list: AnyTodo;
    offset: number;
    organisation: string;
    deviceId: string;
    userId: string;
    filters: AnyTodo;
    dates: DatesProps;
  };

  [ActionTypes.CUSTOMERS_LIST]: {
    list: AnyTodo;
    offset: number;
    organisation: string;
    filters: AnyTodo;
    dates: DatesProps;
  };

  [ActionTypes.QUEUES_LIST]: {
    list: AnyTodo;
    organisation: string;
    strSearch: string;
    checkpoint: string;
  };

  [ActionTypes.QUEUES_SESSION_LIST]: {
    list: AnyTodo;
    strSearch: string;
  };
};

export type UserActions = ActionMap<UserActionPayload>[keyof ActionMap<UserActionPayload>];

export const userReducer = (state: StoreProps, action: UserActions) => {
  switch (action.type) {
    case ActionTypes.CHANGE_PATH:
      return { ...state, path: action.payload };

    case ActionTypes.CHANGE_SELECTED_DATES_DATA:
      return { ...state, selectedDatesData: action.payload };

    case ActionTypes.FRAUD_SCORE_LIST:
      return { ...state, fraudScoreList: action.payload };

    case ActionTypes.CUSTOMERS_LIST:
      return { ...state, customersList: action.payload };

    case ActionTypes.BLOCK_LIST:
      return { ...state, allowBlockList: action.payload };

    case ActionTypes.QUEUES_LIST:
      return { ...state, queuesList: action.payload };

    case ActionTypes.QUEUES_SESSION_LIST:
      return { ...state, queuesSessionList: action.payload };

    default:
      return state;
  }
};
