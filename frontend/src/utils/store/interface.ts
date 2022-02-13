import { AnyTodo, RuleProps } from "sardine-dashboard-typescript-definitions";
import { BlocklistProps } from "../../components/BlockAllowList/RowItem";

export interface UserProps {
  isAuthenticated: boolean;
  role: string;
  organisation: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface PathProps {
  field: string;
  title: string;
}

export interface DatesProps {
  startDate: string;
  endDate: string;
  selectedDateIndex: number;
}

export interface StoreProps {
  user: UserProps;
  path: PathProps;
  selectedDatesData: DatesProps;
  ruleList: RuleListProps;
  ruleData: RulesDataProps;
  fraudScoreList: FraudListProps;
  customersList: CustomersListProps;
  blockAllowList: BlockAllowlistProps;
  queuesList: QueuesListProps;
  queuesSessionList: QueuesSessionListProps;
}

export interface FraudListProps {
  list: AnyTodo[];
  offset: number;
  organisation: string;
  deviceId: string;
  userId: string;
  filters: AnyTodo[];
  dates: DatesProps;
}

export interface CustomersListProps {
  list: AnyTodo[];
  offset: number;
  organisation: string;
  filters: AnyTodo[];
  dates: DatesProps;
}

export interface QueuesListProps {
  list: AnyTodo[];
  organisation: string;
  strSearch: string;
  checkpoint: string;
}

export interface QueuesSessionListProps {
  list: AnyTodo[];
  strSearch: string;
}

export interface ActionProps {
  type: string;
  data: AnyTodo;
}

export interface ConfigProps {
  path: PathProps;
  selectedDatesData: DatesProps;
}

export interface RulesDataProps {
  organisation: string;
  checkpoint: string;
}

export interface RuleListProps {
  rules: RuleProps[];
}

export interface BlockAllowlistProps {
  blocklist: BlocklistProps[];
  allowlist: BlocklistProps[];
  selectedTab: string;
  organisation: string;
  strSearch: string;
  fieldType: string;
  shouldRefresh: boolean;
}
