import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Image, ToggleButtonGroup, ToggleButton, OverlayTrigger, Form, Tooltip, Spinner, Button } from "react-bootstrap";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";
import { CSVReader } from "react-papaparse";
import {
  AnyTodo,
  getSuccessResult,
  isFailure,
  RuleActionTag,
  RULE_ACTION_TYPES,
  RULE_ENV_MODES,
  RuleEnvMode,
  OrganizationUser,
  OrganizationUsersResponse,
  isErrorMessageResponse,
  UpdateRuleRequest,
} from "sardine-dashboard-typescript-definitions";
import { CLIENT_QUERY_FIELD } from "utils/constructFiltersQueryParams";
import { captureException, captureFailure, isErrorWithResponseData } from "utils/errorUtils";
import { replaceAll, replaceAllSpacesWithUnderscores } from "utils/stringUtils";
import { useToasts } from "react-toast-notifications";
import { RULES_PATH } from "modulePaths";
import { useQueryClient } from "react-query";
import {
  createRule,
  getCreatingRuleStats,
  getOrganizationUsers,
  sendUpdateRuleRequest,
  getQueueslist,
  addNewQueue,
  updateQueue,
  createJiraToken,
  getJiraToken,
  fetchOrganisationNames,
  getClientIdObject,
} from "../utils/api";
import Layout from "../components/Layout/Main";
import CustomRule from "../components/RulesModule/CustomRule";
import FunctionsPopup, { getSampleValue, FunctionData } from "../components/RulesModule/FunctionsPopup";
import rightArrow from "../utils/logo/rightArrow.png";
import rightArrowWhite from "../utils/logo/rightArrowWhite.png";
import infoIcon from "../utils/logo/info_blue.svg";
import addIcon from "../utils/logo/add_white.svg";
import deleteIcon from "../utils/logo/delete.svg";
import RadioButton from "../components/Common/RadioButton";
import {
  StyledInput,
  SubmitButton,
  Container,
  ErrorText,
  MainDiv,
  BackgroundBox,
  Title,
  StyledArea,
  StyledHeading,
  StyledSubHeading,
  StyledContainer,
  DropDownLi,
  Dropbtn,
  DropDownContent,
  SubA,
  StyledUl,
  SubDropbtn,
  ChipContainer,
  ChipCancelButton,
  ChipWrapper,
  SubDropDownContent,
  HorizontalSpace,
  Line,
  CSVParent,
  TextNormal,
  GridList,
  RuleOutputTitle,
  RuleOutputContainer,
  DataDictionaryContainer,
} from "../components/RulesModule/styles";
import {
  getRulesData,
  getReasonCodeData,
  DROPDOWN_TYPES,
  DropdownType,
  OPERATORS,
  getRiskValues,
  DROP_DOWN_BG,
  getActionData,
  CHECK_POINTS,
  DATA_TYPES,
  saveActionToStorage,
  FUNCTIONS,
  supportedFunctions,
  getHasOperator,
  ADD_CUSTOM,
  saveActionLevelToStorage,
  BatchRuleData,
  isDurationValue,
  CheckPoint,
  Reason,
  ItemModel,
  FunctionChild,
} from "../utils/dataProviderUtils";
import { DescriptionAndStats } from "../components/RulesModule/DescriptionAndStats";
import QueueSection from "../components/RulesModule/Components/QueueSection";
import CustomInput from "../components/RulesModule/Components/CustomInput";
import BatchRuleView from "../components/RulesModule/Components/BatchRuleView";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "../store/user";
import { CACHE_KEYS, CHECKPOINT_QUERY_FIELD, RULE_ADMIN_CLIENT_ID } from "../constants";
import OrganisationDropDown from "../components/Dropdown/OrganisationDropDown";

type DropdownTypeRulesOrCheckpoint = typeof DROPDOWN_TYPES.Rules | typeof DROPDOWN_TYPES.Checkpoint;

const EMPTY_RULE = {
  rule: "",
  operator: "",
  value: "",
  join: "&&",
  sample: "",
  datatype: DATA_TYPES.string,
  rules: [],
  hasOperator: true,
};

const getEmptyRuleClone = () => ({ ...EMPTY_RULE });

const LinkToDictionary = ({
  title,
  icon,
  style,
  isDemoMode,
}: {
  title: string;
  icon: string;
  style: React.CSSProperties;
  isDemoMode: boolean;
}): JSX.Element => {
  const navigate = useNavigate();
  return (
    <DataDictionaryContainer
      className="rule-editor-list-of-available-fields"
      id="rule_editor_list_of_available_fields"
      style={style}
      onClick={() => {
        navigate(`/data_dictionary${isDemoMode ? "?demo" : ""}`);
      }}
    >
      <Image src={icon} style={{ width: 20, height: 20, marginRight: 10, marginLeft: 10 }} />
      <TextNormal style={{ color: "#2173FF", fontWeight: 500 }}>{title}</TextNormal>
    </DataDictionaryContainer>
  );
};

const CustomInputWrapper = ({
  actionsData,
  checkpoints,
  type,
  setActionsData,
  setCheckpoint,
  setCheckpoints,
  setIsCustomAction,
  setRiskLevel,
  setRiskValue,
}: {
  actionsData: string[];
  checkpoints: string[];
  type: DropdownType;
  setActionsData: React.Dispatch<React.SetStateAction<string[]>>;
  setCheckpoint: React.Dispatch<React.SetStateAction<string>>;
  setCheckpoints: React.Dispatch<React.SetStateAction<string[]>>;
  setIsCustomAction: React.Dispatch<React.SetStateAction<boolean>>;
  setRiskLevel: React.Dispatch<React.SetStateAction<string>>;
  setRiskValue: React.Dispatch<React.SetStateAction<string>>;
}): JSX.Element => (
  <CustomInput
    allowSpace
    onCancelClick={() => {
      if (type === DROPDOWN_TYPES.Checkpoint) {
        setCheckpoint(checkpoints[0]);
      } else if (type === DROPDOWN_TYPES.RiskValue) {
        setRiskValue("");
      } else {
        setIsCustomAction(false);
      }
    }}
    onSubmitClick={(value) => {
      if (type === DROPDOWN_TYPES.Checkpoint) {
        const updatedCheckpoint = checkpoints.filter((e: string) => e !== ADD_CUSTOM);
        setCheckpoints([...updatedCheckpoint, value, ADD_CUSTOM]);
        setCheckpoint(value);
      } else if (type === DROPDOWN_TYPES.RiskValue) {
        saveActionLevelToStorage(value);
        setRiskValue(value);
        setIsCustomAction(false);
      } else {
        setActionsData([...actionsData, value]);
        saveActionToStorage(value);
        setRiskLevel(value);
        setIsCustomAction(false);
      }
    }}
  />
);

interface Organisation {
  name: string;
}

const DropdownContainer = ({
  actions,
  checkpoint,
  checkpoints,
  data,
  getDescription,
  handleDropdownClick,
  index,
  IconArrow,
  isDemoMode,
  isSuperAdmin,
  jiraAPICall,
  lastRuleIndex,
  parentIndex,
  organisation,
  organisations,
  reasonCodes,
  reasonData,
  renderDropDownItem,
  rules,
  rulesData,
  selectedSection,
  selectedReasonSection,
  setActions,
  setActionsData,
  setAssignedTo,
  setCheckpoint,
  setCustomFunctionIndexes,
  setCustomRuleOption,
  setOrganisation,
  setQueueData,
  setReasonCodes,
  setRiskLevel,
  setRiskValue,
  setRules,
  setRulesData,
  setSelectedSection,
  setSelectedSubSections,
  setSelectedReasonSection,
  setUsers,
  setVisibleDropDown,
  subtype,
  type,
  visibleDropDown,
}: {
  actions: RuleActionTag[];
  checkpoint: string;
  checkpoints: string[];
  data: AnyTodo;
  getDescription: (parentIndex: number, index: number) => string;
  handleDropdownClick: (type: string) => void;
  index: AnyTodo;
  IconArrow: React.MemoExoticComponent<(props: AnyTodo) => JSX.Element>;
  isDemoMode: boolean;
  isSuperAdmin: boolean;
  jiraAPICall: (org: string) => Promise<void>;
  lastRuleIndex: () => number;
  parentIndex: AnyTodo;
  organisation: Organisation;
  organisations: Organisation[];
  reasonCodes: string;
  reasonData: Reason[];
  renderDropDownItem: (
    items: readonly (ItemModel | string)[],
    type: DropdownType,
    parentIndex: number,
    index: number,
    parentTitle: string
  ) => JSX.Element | JSX.Element[];
  rules: Rule[];
  rulesData: ItemModel[];
  selectedSection: string;
  selectedReasonSection: string;
  setActions: React.Dispatch<React.SetStateAction<RuleActionTag[]>>;
  setActionsData: React.Dispatch<React.SetStateAction<string[]>>;
  setAssignedTo: React.Dispatch<React.SetStateAction<OrganizationUser | undefined>>;
  setCheckpoint: React.Dispatch<React.SetStateAction<string>>;
  setCustomFunctionIndexes: React.Dispatch<React.SetStateAction<number[]>>;
  setCustomRuleOption: React.Dispatch<React.SetStateAction<string>>;
  setOrganisation: React.Dispatch<React.SetStateAction<Organisation>>;
  setQueueData: React.Dispatch<React.SetStateAction<AnyTodo>>;
  setReasonCodes: React.Dispatch<React.SetStateAction<string>>;
  setRiskLevel: React.Dispatch<React.SetStateAction<string>>;
  setRiskValue: React.Dispatch<React.SetStateAction<string>>;
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  setRulesData: React.Dispatch<React.SetStateAction<ItemModel[]>>;
  setSelectedReasonSection: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSection: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSubSections: React.Dispatch<React.SetStateAction<string[]>>;
  setUsers: React.Dispatch<React.SetStateAction<OrganizationUsersResponse>>;
  setVisibleDropDown: React.Dispatch<React.SetStateAction<string>>;
  subtype: typeof DROPDOWN_TYPES.Operator | "";
  type: DropdownTypeRulesOrCheckpoint;
  visibleDropDown: string;
}) => {
  const handleRuleClick = (value: string, dropdownType: DropdownType, parentIdx: number, idx: number) => {
    if (!value) return;
    if (dropdownType === DROPDOWN_TYPES.Rules) {
      if (value.toLowerCase() === ADD_CUSTOM) {
        setCustomRuleOption(DROPDOWN_TYPES.Rules);
        setVisibleDropDown("");
      } else {
        const val = value === selectedSection ? "" : value;
        setSelectedSection(val);
        setSelectedSubSections([]);

        const ind = rulesData.map((e) => e.title).indexOf(val);
        if (ind >= 0) {
          if (rulesData[ind].items.length === 0) {
            const newRules = [...rules];
            if (parentIdx === -1) {
              newRules[idx].rule = val;
            } else {
              (newRules[parentIdx].rules[idx] as AnyTodo).rule = val;
            }

            setRules(newRules);
            setCustomFunctionIndexes([parentIdx, idx]);
            setVisibleDropDown("");
          }
        }
      }
    } else if (dropdownType === DROPDOWN_TYPES.ReasonCode) {
      if (value.toLowerCase() === ADD_CUSTOM) {
        setCustomRuleOption(DROPDOWN_TYPES.ReasonCode);
        setVisibleDropDown("");
      } else {
        const val = value === selectedReasonSection ? "" : value;
        setSelectedReasonSection(val);

        const ind = reasonData.map((e) => e.title).indexOf(val);
        if (ind >= 0 && reasonData[ind].items.length === 0 && val !== "") {
          setReasonCodes(reasonCodes + val);
          setVisibleDropDown("");
        }
      }
    } else if (dropdownType === DROPDOWN_TYPES.Checkpoint) {
      if (rules.length > 0 && checkpoint !== value) {
        setRules([getEmptyRuleClone()]);
      }

      if (actions.length > 0 && checkpoint !== value) {
        setActions([]);
      }

      setRiskLevel("");
      setRiskValue("");

      setRulesData(getRulesData(isDemoMode, value, isSuperAdmin, organisation.name));
      setActionsData(getActionData(isSuperAdmin, value));
      setCheckpoint(value);
      getQueueslist(organisation.name, value)
        .then((qData) => {
          setQueueData(qData);
        })
        .catch((e) => captureException(e));
      setVisibleDropDown("");
    } else if (dropdownType === DROPDOWN_TYPES.Organization) {
      const filteredOrgs = organisations.filter((e) => e.name === value);

      if (filteredOrgs.length > 0) {
        setOrganisation(filteredOrgs[0]);

        const org = filteredOrgs[0].name;
        setRulesData(getRulesData(isDemoMode, checkpoint, isSuperAdmin, org));
        setAssignedTo(undefined);
        getOrganizationUsers(org)
          .then((d) => {
            if (isFailure(d)) {
              captureFailure(d);
              return;
            }
            const successResult = getSuccessResult(d);
            setUsers(successResult);
          })
          .catch((e) => captureException(e));
        getQueueslist(org, checkpoint)
          .then((d) => {
            setQueueData(d);
          })
          .catch((e) => captureException(e));
        jiraAPICall(org)
          .then()
          .catch((e) => captureException(e));
      }
      setVisibleDropDown("");
    }
  };

  const renderDropDown = (typeRuleOrCheckpoint: DropdownTypeRulesOrCheckpoint, pIndex: number, idx: number): JSX.Element => {
    let result: JSX.Element[] = [];

    if (typeRuleOrCheckpoint === DROPDOWN_TYPES.Rules && rulesData.length > 0) {
      result = rulesData.map((element) => (
        <DropDownLi
          key={element.title}
          className={`rule-editor-dropdown-content-${typeRuleOrCheckpoint}-li`}
          id={`rule_editor_dropdown_content_${typeRuleOrCheckpoint}_li`}
        >
          <SubDropbtn
            onClick={() => handleRuleClick(element.title, typeRuleOrCheckpoint, pIndex, idx)}
            style={{
              backgroundColor: selectedSection === element.title ? "#2173FF" : "",
            }}
            data-tid={`rule_editor_dropdown_content_${type}_li_${parentIndex}_${index}_${element.title}`}
            className="dropdown"
          >
            <Title style={{ color: selectedSection === element.title ? "#FFFFFF" : "#325078" }} className="dropdown">
              {element.title}
            </Title>
            {element.items.length > 0 ? <IconArrow className="dropdown" isSelected={selectedSection === element.title} /> : null}
          </SubDropbtn>
          {selectedSection === element.title && (
            <SubDropDownContent style={{ top: 0, display: "block" }} className="dropdown">
              {" "}
              {renderDropDownItem(element.items, typeRuleOrCheckpoint, pIndex, idx, element.title)}
            </SubDropDownContent>
          )}
        </DropDownLi>
      ));
    } else if (typeRuleOrCheckpoint === DROPDOWN_TYPES.Checkpoint) {
      result = checkpoints.map((element) => (
        <DropDownLi data-tid={`${replaceAllSpacesWithUnderscores(type)}_${element}`} key={element}>
          <SubDropbtn onClick={() => handleRuleClick(element, typeRuleOrCheckpoint, pIndex, idx)} className="dropdown">
            <Title>{element}</Title>
          </SubDropbtn>
        </DropDownLi>
      ));
    }

    return <ul style={{ padding: 0 }}> {result} </ul>;
  };

  const ButtonsForRule = memo((props: { parentIndex: number; index: number }) => {
    const { parentIndex: parentIdx, index: idx } = props;
    return (
      <StyledUl style={{ margin: 0, height: 50, marginRight: 10 }}>
        {parentIdx === -1 ? (
          <Button
            style={{ backgroundColor: "#2173FF", border: "none" }}
            onClick={() => {
              const newRules = [...rules];
              if (parentIdx === -1) {
                const r = newRules[idx].rules;
                if (r.length > 0) {
                  const lastIndex = r.length - 1;
                  if (r[lastIndex].join.length === 0) {
                    newRules[idx].rules[lastIndex].join = "&&";
                  }
                }
                newRules[idx].rules = [...newRules[idx].rules, getEmptyRuleClone()];
              } else {
                const r = newRules[parentIdx].rules[idx].rules;
                if (r.length > 0) {
                  const lastIndex = r.length - 1;
                  if (r[lastIndex].join.length === 0) {
                    newRules[parentIdx].rules[idx].rules[lastIndex].join = "&&";
                  }
                }
                newRules[parentIdx].rules[idx].rules = [newRules[parentIdx].rules[idx].rules, getEmptyRuleClone()];
              }
              setRules(newRules);
            }}
            data-tid={`rule_editor_add_button_${parentIdx + 1}_${idx}`}
          >
            <img alt="" src={addIcon} />
          </Button>
        ) : null}
        <Button
          style={{
            marginLeft: 10,
            backgroundColor: "#F8FBFF",
            border: "none",
          }}
          onClick={() => {
            const newRules = [...rules];
            if (parentIdx === -1) {
              if (newRules[idx].rules.length === 0) {
                newRules.splice(idx, 1);
              } else {
                const parentRule = newRules[idx];
                const firstChild = parentRule.rules[0];
                newRules[idx] = firstChild;
                newRules[idx].rules = parentRule.rules;

                newRules[idx].rules.splice(0, 1);
              }
            } else {
              newRules[parentIdx].rules.splice(idx, 1);
            }
            setRules(newRules);
          }}
          data-tid={`rule_editor_remove_button_${parentIdx + 1}_${idx}`}
        >
          <img alt="" src={deleteIcon} />
        </Button>
      </StyledUl>
    );
  });

  const getDropDownTitle = (dropdownType: DropdownTypeRulesOrCheckpoint, content: AnyTodo, idx: AnyTodo) =>
    dropdownType === DROPDOWN_TYPES.Checkpoint
      ? checkpoint
      : dropdownType === DROPDOWN_TYPES.Rules && content.length > 0 && content[idx].rule.length > 0
      ? content[idx].rule
      : "Select Field";

  return (
    <Container
      className={`rule-editor-dropdown-${type}-container`}
      id={`rule_editor_dropdown_${type}_container`}
      key={index}
      style={{
        backgroundColor: "transparent",
        width: "max-content",
        display: type === DROPDOWN_TYPES.Rules ? "flex" : "unset",
      }}
    >
      {type === DROPDOWN_TYPES.Rules ? (
        index === lastRuleIndex() && parentIndex === -1 ? null : (
          <ButtonsForRule parentIndex={parentIndex} index={index} key={index} />
        )
      ) : (
        <StyledSubHeading style={{ textTransform: "capitalize", fontWeight: 600 }}>{type}</StyledSubHeading>
      )}

      <DropDownLi>
        {type === DROPDOWN_TYPES.Rules ? (
          <OverlayTrigger
            placement="top"
            overlay={
              index !== lastRuleIndex() &&
              ((parentIndex === -1 && rules[index].rule.length > 0) ||
                (parentIndex !== -1 && rules[parentIndex].rules[index].rule.length > 0)) ? (
                <Tooltip>{getDescription(parentIndex, index)}</Tooltip>
              ) : (
                <Tooltip style={{ display: "none" }} />
              )
            }
          >
            <Dropbtn
              id={`rule_editor_dropbtn_${type}`}
              data-tid={`rule_editor_dropdown_${type}_${index}`}
              style={{
                height: 40,
                alignItems: "center",
                backgroundColor: DROP_DOWN_BG,
                textTransform: "capitalize",
                width: type === DROPDOWN_TYPES.Rules ? "100%" : 270,
              }}
              onClick={() => handleDropdownClick(type === DROPDOWN_TYPES.Rules ? type + parentIndex + index : type)}
              className="dropdown"
            >
              {getDropDownTitle(type, data, index)}
            </Dropbtn>
          </OverlayTrigger>
        ) : (
          <Dropbtn
            id={`rule_editor_dropbtn_${type}`}
            style={{
              height: 40,
              alignItems: "center",
              backgroundColor: DROP_DOWN_BG,
              textTransform: "capitalize",
              width: 270,
            }}
            onClick={() => handleDropdownClick(type)}
            className="dropdown"
          >
            {getDropDownTitle(type, data, index)}
          </Dropbtn>
        )}
        <DropDownContent
          className={`rule-editor-dropdown-content-${type}`}
          id={`rule_editor_dropdown_content_${type}`}
          data-tid={`rule_editor_dropdown_content_${type}_${index}`}
          style={{
            display:
              (type === DROPDOWN_TYPES.Rules && visibleDropDown === type + parentIndex + index) || type === visibleDropDown
                ? "block"
                : "",
            maxHeight: type === DROPDOWN_TYPES.Rules ? "none" : 300,
            overflowY: type === DROPDOWN_TYPES.Rules ? undefined : "scroll",
          }}
        >
          {renderDropDown(type, parentIndex, index)}
        </DropDownContent>
      </DropDownLi>
      {subtype === DROPDOWN_TYPES.Operator ? (
        !data[index].hasOperator ? null : (
          <DropDownLi>
            <Dropbtn
              data-tid={`rule_helper_${index}_operator`}
              style={{
                width: 100,
                marginLeft: 10,
                height: 40,
                alignItems: "center",
                backgroundColor: DROP_DOWN_BG,
              }}
              onClick={() =>
                handleDropdownClick(
                  subtype === DROPDOWN_TYPES.Operator && type === DROPDOWN_TYPES.Rules
                    ? `${type}sub${parentIndex}${index}`
                    : subtype
                )
              }
              className="dropdown"
            >
              {subtype === DROPDOWN_TYPES.Operator &&
              type === DROPDOWN_TYPES.Rules &&
              data.length > 0 &&
              data[index].operator.length > 0
                ? data[index].operator
                : "Operator"}
            </Dropbtn>
            <DropDownContent
              className={`rule-editor-dropdown-subcontent-${type}`}
              id={`rule_editor_dropdown_subcontent_${type}`}
              data-tid={`rule_helper_operator_${index}_options`}
              style={{
                width: 120,
                marginLeft: 10,
                display:
                  (subtype === DROPDOWN_TYPES.Operator &&
                    type === DROPDOWN_TYPES.Rules &&
                    visibleDropDown === `${type}sub${parentIndex}${index}`) ||
                  subtype === visibleDropDown
                    ? "block"
                    : "",
              }}
            >
              {renderDropDownItem(OPERATORS, subtype, parentIndex, index, "")}
            </DropDownContent>
          </DropDownLi>
        )
      ) : null}
    </Container>
  );
};

interface Rule {
  rule: string;
  operator: string;
  value: string;
  join: string;
  sample: string;
  datatype: string;
  rules: AnyTodo[];
  hasOperator: boolean;
}

const ERROR_TYPES = {
  Rule: "Rule name is required",
  Condition: "Condition is required",
  Organization: "Organization is required",
} as const;

const ManageRule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sendDataToGTM = useGTMDispatch();
  const ref = useRef(null);
  const { addToast } = useToasts();

  const isDemoMode = location.search.toLowerCase().includes("demo");
  const { isSuperAdmin, organisationFromUserStore, isAdmin } = useUserStore((state) => {
    const { organisation } = state;
    return {
      isSuperAdmin: selectIsSuperAdmin(state),
      organisationFromUserStore: organisation,
      isAdmin: selectIsAdmin(state),
    };
  });

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubSections, setSelectedSubSections] = useState<string[]>([]);
  const [selectedReasonSection, setSelectedReasonSection] = useState("");
  const [rules, setRules] = useState<Rule[]>([getEmptyRuleClone()]);
  const [reasonCodes, setReasonCodes] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [riskValue, setRiskValue] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [visibleDropDown, setVisibleDropDown] = useState("");
  const [checkpoints, setCheckpoints] = useState<(CheckPoint | typeof ADD_CUSTOM | string)[]>([
    CHECK_POINTS.ACH,
    CHECK_POINTS.AML,
    CHECK_POINTS.AMLBank,
    CHECK_POINTS.AMLCrypto,
    CHECK_POINTS.AMLIssuer,
    CHECK_POINTS.Customer,
    CHECK_POINTS.Devices,
    CHECK_POINTS.Login,
    CHECK_POINTS.Onboarding,
    CHECK_POINTS.Payment,
    CHECK_POINTS.Withdrawal,
    CHECK_POINTS.IssuingRisk,
  ]);
  const [checkpoint, setCheckpoint] = useState<CheckPoint | typeof ADD_CUSTOM | string>(CHECK_POINTS.AML);
  const [isCustomAction, setIsCustomAction] = useState(false);
  const [customRuleOption, setCustomRuleOption] = useState("");
  const [environment, setEnvironment] = useState<RuleEnvMode>(RULE_ENV_MODES.Shadow);
  const [isActive, setIsActive] = useState(true);
  const [actions, setActions] = useState<RuleActionTag[]>([]);
  const [dataLoaded, setdDataLoaded] = useState(false);
  const [organisations, setOrganisations] = useState<AnyTodo[]>([]);
  const [organisation, setOrganisation] = useState<AnyTodo>(null);

  const [queue, setQueue] = useState<AnyTodo>(undefined);
  const [users, setUsers] = useState<OrganizationUsersResponse>([]);
  const [assignedTo, setAssignedTo] = useState<OrganizationUser | undefined>(undefined);
  const [jiraData, setJiraData] = useState<AnyTodo>();
  const [orgJiraData, setOrgJiraData] = useState<AnyTodo>();
  const [enableCaseManagement, setEnableCaseManagement] = useState(false);

  const [error, setError] = useState("");
  const [rulesData, setRulesData] = useState<ItemModel[]>([]);
  const [reasonData, setReasonData] = useState<Reason[]>([...getReasonCodeData(), { title: ADD_CUSTOM, items: [] }]);

  const [actionsData, setActionsData] = useState(getActionData(isSuperAdmin, CHECK_POINTS.Customer));

  const [queueData, setQueueData] = useState<AnyTodo[]>([]);
  const [customFunctionIndexes, setCustomFunctionIndexes] = useState<number[]>([]);

  const [enableBatchMode, setEnableBatchMode] = useState(false);
  const [batchRuleData, setBatchRuleData] = useState<BatchRuleData>();

  const [apiInvoking, setApiInvoking] = useState(false);
  const [clientId, setClientId] = useState("");
  const queryClient = useQueryClient();

  const lastRuleIndex = () => rules.length - 1;

  // TODO: Stop using ReactRouter's state management. It lacks the ability to specify the type of the state. https://github.com/reach/router/issues/414
  const pageState = location.state;
  const ruleDetails = pageState ? (pageState as AnyTodo).ruleDetails : undefined;

  const changeOrganisation = (org: string) => {
    setOrganisation({ name: org });
  };

  useEffect(() => {
    if (queue && assignedTo) {
      setEnableCaseManagement(true);
    }
  }, [queue, assignedTo]);

  useEffect(() => {
    if (organisation && organisation.name) {
      getClientIdObject(organisation.name)
        .then((data) => data.client_id && setClientId(data.client_id))
        .catch((e) => captureException(e));
    }
  }, [organisation]);

  const jiraAPICall = useCallback(
    async (org: string) => {
      try {
        const clientID = clientId || (await getClientIdObject(org)).client_id;
        if (clientID) {
          const tokenData = await getJiraToken(clientID);

          setOrgJiraData(tokenData.result);
        }
      } catch (e) {
        captureException(e);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (batchRuleData && batchRuleData.BatchDuration !== "") {
      setEnableBatchMode(true);
    }
  }, [batchRuleData]);

  // Function to prepare rule UI from given condition.
  // We have 3 sections for each condition:
  //  1. Feature (selected from feature dropdown)
  //  2. Operator (like ==, >=, <= etc.)
  //  3. Value (can be string, bool, array etc. depends on the selected operator)
  const setRulesFromConidtion = (condition: AnyTodo) => {
    if (condition) {
      // We have 2 outer operators i.e. &&, ||
      // Splitting rule with first one i.e. AND (&&)
      const firstSplit = condition.trim().split(" && ");
      let ruleData: AnyTodo[] = [];

      // Looping 1nd outer split to perform 2nd outer split
      firstSplit.forEach((d: AnyTodo) => {
        // Perform 2nd outer split i.e. OR (||)
        d.split(" || ").forEach((r: AnyTodo) => {
          // After both outer operator splits we'll have inner conditions in ruleData
          // Removing modified string values like not_in, in with spaces etc.
          ruleData = [
            ...ruleData,
            r
              .replace(/, /g, ",")
              .replace(/not in/g, "not_in")
              .replace(/ {2}in {2}/g, " in ")
              .trim()
              .split(" ")
              .map((val: AnyTodo) => val.replace(/not_in/g, "not in")),
          ];
        });
      });

      let strData = condition.trim();
      ruleData.forEach((d) => {
        d.forEach((e: AnyTodo) => {
          strData = strData.replace(e, "");
        });
      });

      // For inner conditions we have space (" ") to split the feature, operator and value
      const joiners = strData.split(" ").filter((d: AnyTodo) => d.length > 0 && (d.includes("||") || d.includes("&&")));
      let rulesFromDetail: AnyTodo[] = [];
      let childEndBreaket = false;
      let childStartBreaket = false;
      let lastParentIndex = 0;

      // Looping ruleData (inner condition values) to prepare RULE object for UI
      ruleData.forEach((d, index) => {
        const j = joiners.length > index ? joiners[index] : "&&";

        const param = d.length > 0 ? d[0] : "";
        let hasOperator = false; // Bool to decide does the inner condition has operator or it's functional condition
        let hasFunction = false;

        let p = param.replace(/\(/g, "");

        // check if the param (feature) has any custom functions in it or not
        supportedFunctions.forEach((functionData: FunctionChild) => {
          const val = functionData.value;
          const regex = new RegExp(val, "g");
          p = p.replace(regex, `${val}(`);
          if (param.includes(val)) {
            hasFunction = true;
            hasOperator = functionData.hasOperator;
          }
        });

        // Custom functions will have additional brackets so managing it.
        if (hasFunction && p.includes("))")) {
          p = replaceAll(p, "))", ")");
        }

        if (!hasFunction) {
          hasOperator = true;
        }

        // Checking the operator value
        const opt = d.length > 1 ? d[1] : hasOperator ? " == " : "";

        // Checking the value of feature
        const val =
          d.length > 2
            ? d
                .map((i: AnyTodo, ind: AnyTodo) => (ind > 1 ? i : ""))
                .join("")
                .trim()
            : hasOperator
            ? "true"
            : "";

        // Variables to hold sample & expected data type of the feature
        let sampleValue = "";
        let dataTypeValue = "";

        // Checking for the subparam means the child condition
        if (param.length > 0) {
          const subParam = param.split(".");
          if (subParam.length > 1) {
            const { datatype, sample } = getSampleValue(subParam[0], subParam[1]);
            sampleValue = sample;
            dataTypeValue = datatype;
          }
        }

        // Prepared RULE object for the UI
        const newRule = {
          rule: p,
          operator: opt,
          value: val.replace(/\)/g, ""),
          join: j,
          sample: sampleValue,
          datatype: dataTypeValue,
          rules: [],
          hasOperator,
        };

        // If it's the child then add it in the RULES array of previous object
        if (childStartBreaket && !childEndBreaket) {
          rulesFromDetail[lastParentIndex].rules = [...rulesFromDetail[lastParentIndex].rules, newRule];
        } else {
          rulesFromDetail = [...rulesFromDetail, newRule];
        }

        // Condition to decide is it child rule or not
        if (param.charAt(0) === "(") {
          childStartBreaket = true;
          lastParentIndex = rulesFromDetail.length - 1;
        } else if (val.includes(")") || (!hasOperator && param.includes("))"))) {
          childEndBreaket = true;
        }
      });

      // Finalized array with an empty rule at the bottom
      rulesFromDetail = [...rulesFromDetail, getEmptyRuleClone()];

      setRules(rulesFromDetail);
    }
  };

  useEffect(() => {
    function setDataToEdit() {
      if (ruleDetails) {
        setName(ruleDetails.name);
        setDescription(ruleDetails.description);
        setReasonCodes(ruleDetails.reasonCodesExpr);
        setEnvironment(ruleDetails.isShadow ? RULE_ENV_MODES.Shadow : RULE_ENV_MODES.Live);
        setIsActive(!ruleDetails.depreciated);
        setdDataLoaded(true);

        setRulesFromConidtion(ruleDetails.condition);

        if (ruleDetails.action && ruleDetails.action.tags) {
          setActions(ruleDetails.action.tags);
        }

        if (ruleDetails.batchCount && ruleDetails.batchDuration) {
          setBatchRuleData({
            BatchCount: `${ruleDetails.batchCount}`,
            BatchDuration: ruleDetails.batchDuration,
          });
        }
      }
    }

    async function queueAPICalls(org: AnyTodo) {
      try {
        const res = await getOrganizationUsers(org);
        if (isFailure(res)) {
          captureFailure(res);
          return;
        }
        const userList = getSuccessResult(res);
        setUsers(userList);

        const queuesData = await getQueueslist(org, checkpoint);
        setQueueData(queuesData);

        if (ruleDetails && ruleDetails.queueID) {
          const filteredQueue = queuesData.filter((d: AnyTodo) => d.id === ruleDetails.queueID);
          if (filteredQueue.length > 0) {
            const qData = filteredQueue[0];
            const uData = userList;

            setQueue(qData);
            if (uData.length > 0) {
              const filteredUser = uData.filter((d: AnyTodo) => d.id === qData.owner_id);

              if (filteredUser.length > 0) {
                setAssignedTo(filteredUser[0]);
              }
            }
          }
        }
      } catch (e) {
        setError(e as AnyTodo);
        captureException(e);
      }
    }

    async function manageDetails() {
      try {
        if (isAdmin) {
          const orgData = await fetchOrganisationNames();
          setOrganisations(orgData);

          if (ruleDetails) {
            if (ruleDetails.organisation !== undefined) {
              setOrganisation({ name: ruleDetails.organisation });
            }

            if (ruleDetails.checkpoint !== undefined) {
              setCheckpoint(ruleDetails.checkpoint);
              setActionsData(getActionData(isAdmin, ruleDetails.checkpoint));
            }

            if (ruleDetails.checkpoint && ruleDetails.organisation) {
              const orgName = ruleDetails.organisation.name ? ruleDetails.organisation.name : ruleDetails.organisation;
              setRulesData(getRulesData(isDemoMode, ruleDetails.checkpoint, isAdmin, orgName) as AnyTodo);
              Promise.all([queueAPICalls(orgName), jiraAPICall(orgName)]).catch((e) => {
                captureException(e);
              });
            }
          } else if (orgData.length > 0) {
            setOrganisation(orgData[0]);
            const org = orgData[0].name;
            setRulesData(getRulesData(isDemoMode, checkpoint, isAdmin, org) as AnyTodo);
            Promise.all([queueAPICalls(org), jiraAPICall(org)]).catch((e) => {
              captureException(e);
            });
          }
        } else {
          if (ruleDetails) {
            if (ruleDetails.checkpoint !== undefined) {
              setCheckpoint(ruleDetails.checkpoint);
              setActionsData(getActionData(isSuperAdmin, ruleDetails.checkpoint));
              setRulesData(getRulesData(isDemoMode, ruleDetails.checkpoint, isAdmin, organisationFromUserStore) as AnyTodo);
            }
          } else {
            setRulesData(getRulesData(isDemoMode, checkpoint, isAdmin, organisationFromUserStore) as AnyTodo);
          }

          setOrganisation({ name: organisationFromUserStore } as AnyTodo);
          Promise.all([queueAPICalls(organisationFromUserStore), jiraAPICall(organisationFromUserStore)]).catch((e) => {
            captureException(e);
          });
        }
      } catch (e: unknown) {
        setError("error");
        captureException(e);
      }
    }

    manageDetails()
      .then(setDataToEdit)
      .catch((e) => captureException(e));

    // eslint-disable-next-line
  }, [dataLoaded, ruleDetails]);

  const calculatePerfBasedOnPast = async () => {
    // TBC: https://sardine.atlassian.net/browse/ENG-1184
    try {
      await getCreatingRuleStats({}, (organisation && organisation.name) || organisationFromUserStore);
    } catch (err) {
      console.log(err);
    }
  };

  const isValidCondition = (r: AnyTodo) =>
    (r.rule.length > 0 && !r.hasOperator) || (r.rule.length > 0 && r.hasOperator && r.operator.length > 0 && r.value.length > 0);

  const isValidData = () => {
    if (organisation === null || organisation.name === undefined) {
      setError(ERROR_TYPES.Organization);
      return false;
    }
    if (name.length === 0) {
      setError(ERROR_TYPES.Rule);
      return false;
    }
    if (rules.length === 1 && !isValidCondition(rules[0])) {
      setError(ERROR_TYPES.Condition);
      return false;
    }

    return true;
  };

  const onSubmitAction = async () => {
    setError("");
    const isShadow = environment === RULE_ENV_MODES.Shadow;
    if (isDemoMode && !isShadow) {
      setError("You can only add a shadow rule in demo mode");
      return;
    }
    if (isValidData()) {
      try {
        const actionTags = actions.map((a) => {
          const action = a;
          action.actionType = "update_tag";
          return action;
        });

        if (riskValue.length > 0 && riskLevel.length > 0) {
          actionTags.push({
            key: riskLevel,
            value: riskValue,
            actionType: "update_tag",
          });
        }

        setApiInvoking(true);
        const clientID = clientId || (await getClientIdObject((organisation as AnyTodo).name)).client_id;
        let queueID = queue && queue.id;
        if (queue && assignedTo) {
          if (queueID.length === 0) {
            const newQueue = await addNewQueue({
              organisation: (organisation as AnyTodo).name,
              name: queue.name,
              owner_id: assignedTo.id,
              checkpoint,
              jira_enabled: jiraData && jiraData.token !== "",
            });

            queueID = newQueue;
          } else if (queue.owner_id !== assignedTo.id) {
            await updateQueue({
              id: queueID,
              organisation: organisation.name,
              name: queue.name,
              owner_id: assignedTo.id,
              checkpoint,
              jira_enabled: jiraData && jiraData.token !== "",
            });
          }
        } else if (ruleDetails !== undefined && ruleDetails !== null && ruleDetails.queueID !== "") {
          queueID = "";
        }

        if (jiraData && clientID && jiraData.token !== "") {
          await createJiraToken({
            clientId: clientID,
            email: jiraData.email,
            token: jiraData.token,
            url: jiraData.url,
          });
        }

        setApiInvoking(false);

        const payload: UpdateRuleRequest = {
          rule: {
            queueID: queueID || "",
            name,
            condition: getFinalRule(true),
            depreciated: !isActive,
            description,
            reasonCodesExpr: reasonCodes,
            isShadow,
            action: {
              tags: actionTags,
            },
          },
          clientID,
          checkpoint: checkpoint.toLowerCase(),
          isDemo: isDemoMode,
        };
        const redirectUrl = new URL(RULES_PATH, window.origin);
        redirectUrl.searchParams.append(CHECKPOINT_QUERY_FIELD, checkpoint);
        redirectUrl.searchParams.append(CLIENT_QUERY_FIELD, organisation.name);
        const sucessfullyRedirect = () => navigate(redirectUrl.pathname + redirectUrl.search);

        if (isSuperAdmin && batchRuleData) {
          const { BatchCount, BatchDuration } = batchRuleData;
          if (BatchDuration.length > 0 && !Number.isNaN(parseInt(BatchCount, 10))) {
            payload.rule.batchCount = parseInt(BatchCount, 10);
            payload.rule.batchDuration = BatchDuration;
          }
        }

        if (ruleDetails === null || ruleDetails === undefined) {
          setApiInvoking(true);

          const res = await createRule(payload, organisation.name);
          setApiInvoking(false);
          if (res.error) {
            setError(res.error);
          } else {
            // TODO: Use react-query mutation and move it to some function outside the React component. https://react-query.tanstack.com/guides/updates-from-mutation-responses
            await queryClient.invalidateQueries([CACHE_KEYS.RULES, organisation.name, checkpoint]);
            sendDataToGTM({
              event: "RuleAdded",
              value: payload.rule.condition,
            });
            sucessfullyRedirect();
          }
        } else {
          payload.rule.id = parseInt(ruleDetails.id, 10);
          setApiInvoking(true);
          const res = await sendUpdateRuleRequest(payload, organisation.name);
          setApiInvoking(false);
          if (isErrorMessageResponse(res)) {
            setError(res.error);
          } else {
            // TODO: Use react-query mutation and move it to some function outside the React component. https://react-query.tanstack.com/guides/updates-from-mutation-responses
            await queryClient.invalidateQueries([CACHE_KEYS.RULES, organisation.name, checkpoint]);
            sendDataToGTM({
              event: "RuleUpdated",
              value: payload.rule.condition,
            });
            sucessfullyRedirect();
          }
        }
      } catch (err) {
        setApiInvoking(false);
        let message = "Failed to manage rule";
        if (isErrorWithResponseData(err)) {
          message = err.response.data;
        }
        setError(message);
        captureException(error);
      }
    }
  };

  const IconArrow = memo((props: AnyTodo) => {
    const { isSelected, style } = props;
    return (
      <Image src={isSelected ? rightArrowWhite : rightArrow} style={{ ...style, width: 10, height: 10, alignSelf: "center" }} />
    );
  });

  const prepareValueForString = (r: Rule, validate: boolean) => {
    if (!validate) {
      return r.value;
    }

    return r.datatype === DATA_TYPES.string && r.value.length > 0 && ![" in ", " not in ", "in", "not in"].includes(r.operator)
      ? `"${r.value.replace(/"/g, "").replace(/'/g, "")}"`
      : r.value;
  };

  const getFinalRule = (validateString: boolean) => {
    let finalRule = "";
    if (rules.length === 1) {
      const r = rules[0];
      if (!isValidCondition(r)) {
        return "N/A";
      }
      return `${r.rule} ${r.operator} ${prepareValueForString(r, validateString)}`.trim();
    }
    rules.forEach((r, index) => {
      if (index < lastRuleIndex()) {
        if (r.rules.length > 0) {
          finalRule += " (";
        }
        finalRule +=
          `${r.rule} ${r.operator} ${prepareValueForString(r, validateString)}`.trim() +
          (index !== rules.length - 2 && r.rules.length === 0 ? ` ${r.join} ` : "");

        if (r.rules.length > 0) {
          finalRule += ` ${r.join} `;
          (r.rules as AnyTodo).forEach((sr: AnyTodo, ind: number) => {
            finalRule +=
              `${sr.rule} ${sr.operator} ${prepareValueForString(sr, validateString)}`.trim() +
              (ind !== r.rules.length - 1 ? ` ${sr.join} ` : "");
          });
          const hasMoreData = rules.length - 1 > index + 1;
          finalRule += `) ${hasMoreData ? `${r.rules[r.rules.length - 1].join} ` : ""}`;
        }
      } else if (isValidCondition(r)) {
        const oldRule = rules[index - 1];
        finalRule += ` ${oldRule.join} ${r.rule} ${r.operator} ${prepareValueForString(r, validateString)}`;
      }
    });

    return finalRule.length === 0 ? "N/A" : finalRule.trim();
  };

  const handleItemClick = (value: AnyTodo, type: DropdownType, parentIndex: number, index: number, parentTitle: string) => {
    if (!value) return;

    if (type === DROPDOWN_TYPES.Rules) {
      const newRules = [...rules];

      let subValues = selectedSubSections;
      // parentTitle would be like PaymentMethod_Bank_PrimaryIdentity_Address_City
      // And we already have first & last value so removing them from the list and considering intermediate features
      const pathValues = parentTitle.split("_");
      if (pathValues.length > 1) {
        pathValues.shift(); // Remove main section value
        pathValues.pop(); // Remove last selected value
        subValues = pathValues;
      }

      const val =
        subValues.length > 0
          ? `${selectedSection}.${subValues.join(".")}${
              value.toLowerCase() !== "all" ? (isDurationValue(value) ? `_${value}` : `.${value}`) : ""
            }`
          : `${selectedSection}.${value}`;

      const valueForSampleData = subValues.length > 0 && isDurationValue(value) ? subValues[subValues.length - 1] : value;
      const { sample, datatype } = getSampleValue(selectedSection, valueForSampleData);

      const hasOperator = getHasOperator(val);

      if (parentIndex === -1) {
        newRules[index].rule = val;
        newRules[index].sample = sample;
        newRules[index].datatype = datatype;
        newRules[index].hasOperator = hasOperator;
      } else {
        newRules[parentIndex].rules[index].rule = val;
        newRules[parentIndex].rules[index].sample = sample;
        newRules[parentIndex].rules[index].datatype = datatype;
        newRules[parentIndex].rules[index].hasOperator = hasOperator;
      }
      setRules(newRules);
      setSelectedSubSections([]);
      setSelectedSection("");
    } else if (type === DROPDOWN_TYPES.Operator) {
      const newRules = [...rules];
      if (parentIndex === -1) {
        newRules[index].operator = value;
      } else {
        newRules[parentIndex].rules[index].operator = value;
      }
      setRules(newRules);
    } else if (type === DROPDOWN_TYPES.ReasonCode) {
      setSelectedReasonSection(value);
      setReasonCodes(`${reasonCodes} ${selectedReasonSection}.${value}`);
    } else if (type === DROPDOWN_TYPES.ReasonOperator) {
      setReasonCodes(`${reasonCodes} ${value}`);
    } else if (type === DROPDOWN_TYPES.RiskLevel) {
      setRiskLevel(value);
    } else if (type === DROPDOWN_TYPES.RiskValue) {
      setRiskValue(value);
    }

    setVisibleDropDown("");
  };

  const renderDropDownItem = (
    items: readonly (ItemModel | string)[],
    type: DropdownType,
    parentIndex: number,
    index: number,
    parentTitle: string // Added title to capture the path of the node by creating parent_node string
  ): JSX.Element | JSX.Element[] =>
    items.map((item: AnyTodo) =>
      item.title === undefined ? (
        <SubA
          data-tid={`${type}_${parentIndex}_${index}_${item}`.replace(/_NaN/g, "")}
          key={item}
          onClick={() => handleItemClick(item, type, parentIndex, index, `${parentTitle}_${item.title}`)}
          className="dropdown"
        >
          {item}
        </SubA>
      ) : item.items.length === 0 ? (
        <SubA
          data-tid={`${type}_${parentIndex}_${index}_${item.title}`.replace(/_NaN/g, "")}
          key={item.title}
          onClick={() => handleItemClick(item.title, type, parentIndex, index, `${parentTitle}_${item.title}`)}
          className="dropdown"
        >
          {item.title}
        </SubA>
      ) : (
        <div
          className={`rule-editor-dropdown-subcontent-${type}-li`}
          id={`rule_editor_dropdown_subcontent_${type}-li_${item.title}`}
          key={item.title}
        >
          <SubDropbtn
            key={item.title}
            onClick={() => {
              const section = rulesData.filter((r: AnyTodo) => r.title === selectedSection);
              if (section.length > 0) {
                // Splitting each value from path by _
                const itemPath = `${parentTitle}_${item.title}`;
                const pathValues = itemPath.split("_");
                if (pathValues.length > 0) {
                  pathValues.shift(); // Removing first element as it is section and not subsection
                  setSelectedSubSections(pathValues);
                }
              }
            }}
            style={{
              width: 280,
              backgroundColor: selectedSubSections.includes(item.title) ? "#2173FF" : "#fff",
            }}
            className="dropdown"
          >
            <Title
              style={{ height: 20, color: selectedSubSections.includes(item.title) ? "#FFFFFF" : "#325078" }}
              className="dropdown"
            >
              {item.title}
            </Title>
            {item.items.length > 0 ? (
              <IconArrow className="dropdown" isSelected={selectedSubSections.includes(item.title)} />
            ) : null}
          </SubDropbtn>
          {selectedSubSections.includes(item.title) && (
            <SubDropDownContent style={{ top: 0, left: 280, display: "block" }} className="dropdown">
              {renderDropDownItem(item.items, type, parentIndex, index, `${parentTitle}_${item.title}`)}
            </SubDropDownContent>
          )}
        </div>
      )
    );

  const handleDropdownClick = (type: string) => {
    const t = visibleDropDown === type ? "" : type;
    setVisibleDropDown(t);
  };

  const renderActions = () => {
    const additionalStyle = {
      width: 150,
      marginLeft: 10,
      display: DROPDOWN_TYPES.RiskValue === visibleDropDown ? "block" : "",
    };
    const shouldDisable = riskLevel.length === 0 || riskValue.length === 0;

    return (
      <Container className="rule-actions" id="rule_actions">
        <StyledUl style={{ height: 70, justifyContent: "left" }}>
          <DropDownLi>
            <Dropbtn
              data-tid="action_select_title"
              style={{
                backgroundColor: DROP_DOWN_BG,
                height: 40,
                alignItems: "center",
              }}
              onClick={() => handleDropdownClick(DROPDOWN_TYPES.RiskLevel)}
              className="dropdown"
            >
              {riskLevel.length === 0 ? "Select Title" : riskLevel}
            </Dropbtn>
            <DropDownContent
              data-tid="action_select_title_options"
              style={{
                display: DROPDOWN_TYPES.RiskLevel === visibleDropDown ? "block" : "",
              }}
              className="dropdown"
            >
              {renderDropDownItem(actionsData, DROPDOWN_TYPES.RiskLevel, NaN, NaN, "")}
            </DropDownContent>
          </DropDownLi>
          {riskValue === ADD_CUSTOM ? (
            <div style={{ margin: "0px 20px" }}>
              <CustomInputWrapper
                actionsData={actionsData}
                checkpoints={checkpoints}
                setActionsData={setActionsData}
                setCheckpoint={setCheckpoint}
                setCheckpoints={setCheckpoints}
                setIsCustomAction={setIsCustomAction}
                setRiskLevel={setRiskLevel}
                setRiskValue={setRiskValue}
                type={DROPDOWN_TYPES.RiskValue}
              />
            </div>
          ) : (
            <DropDownLi>
              <Dropbtn
                data-tid="action_value"
                style={{
                  ...additionalStyle,
                  backgroundColor: DROP_DOWN_BG,
                  height: 40,
                  alignItems: "center",
                  display: "",
                }}
                onClick={() => handleDropdownClick(DROPDOWN_TYPES.RiskValue)}
                className="dropdown"
              >
                {riskValue.length === 0 ? "Value" : riskValue}
              </Dropbtn>
              <DropDownContent data-tid="action_value_options" style={additionalStyle} className="dropdown">
                {renderDropDownItem(getRiskValues(), DROPDOWN_TYPES.RiskValue, NaN, NaN, "")}
              </DropDownContent>
            </DropDownLi>
          )}
          <SubmitButton
            className="button-add-action"
            id="button_add_action"
            type="submit"
            style={{
              marginLeft: 10,
              width: 120,
              height: 40,
              backgroundColor: shouldDisable ? "lightgrey" : "#2173FF",
            }}
            disabled={shouldDisable}
            onClick={() => {
              const filteredActions = actions.filter((a) => a.key !== riskLevel);
              const updatedActions = [
                ...filteredActions,
                { key: riskLevel, value: riskValue, actionType: RULE_ACTION_TYPES.UPDATE_TAG },
              ];
              setActions(updatedActions);
              setRiskLevel("");
              setRiskValue("");
            }}
          >
            <span>+ Add Action</span>
          </SubmitButton>
        </StyledUl>
        {isCustomAction ? (
          <CustomInputWrapper
            actionsData={actionsData}
            checkpoints={checkpoints}
            setActionsData={setActionsData}
            setCheckpoint={setCheckpoint}
            setCheckpoints={setCheckpoints}
            setIsCustomAction={setIsCustomAction}
            setRiskLevel={setRiskLevel}
            setRiskValue={setRiskValue}
            type={DROPDOWN_TYPES.RiskLevel}
          />
        ) : (
          <Button
            className="button_add_custom_action"
            id="button_add_custom_action"
            style={{
              backgroundColor: "#F8FBFF",
              border: "none",
              height: 35,
            }}
            onClick={() => {
              setIsCustomAction(true);
            }}
          >
            <TextNormal style={{ color: "#2173FF", fontWeight: 500 }}>+ Add Custom Action</TextNormal>
          </Button>
        )}
      </Container>
    );
  };

  const isWideScreen = () => window.screen.width > 800;

  const getDescription = (parentIndex: number, index: number) => {
    let desc = "";

    let ruleData: AnyTodo = {};
    if (parentIndex === -1) {
      ruleData = rules[index];
    } else {
      ruleData = rules[parentIndex].rules[index];
    }

    if (ruleData.rule) {
      const splitData = ruleData.rule.split(".");

      if (splitData.length > 2) {
        const splitLastEle = splitData[2].split("_");

        const sectionFilter = rulesData.filter((r) => r.title === splitData[0]);
        if (sectionFilter.length > 0) {
          const subSectionFilter = sectionFilter[0].items.filter((r) => r.title === splitData[1]);
          if (subSectionFilter.length > 0) {
            const subToSubSectionFilter = subSectionFilter[0].items.filter((r) => r.title === splitLastEle[0]);
            if (subToSubSectionFilter.length > 0) {
              desc = `${subToSubSectionFilter[0].description}`;
            }
          }
        }
      } else if (splitData.length > 1) {
        const sectionFilter = rulesData.filter((r) => r.title === splitData[0]);
        const splitLastEle = splitData[1].split("_");
        if (sectionFilter.length > 0) {
          const subSection = sectionFilter[0].items.filter(
            (sub: AnyTodo) => splitLastEle[0].toLowerCase() === sub.title.toLowerCase()
          );
          if (subSection.length > 0) {
            desc = `${subSection[0].description}`;
          }
        }
      }

      if (supportedFunctions.filter((f) => ruleData.rule.includes(f.value)).length > 0) {
        const matches = supportedFunctions.filter((f) => ruleData.rule.includes(f.value));
        matches.forEach((m) => {
          if (m.description.length > 0) {
            desc = m.description;
          }
        });
      }
    }

    return desc;
  };

  const handleOnError = () => {
    addToast("Failed to load csv file", {
      appearance: "error",
      autoDismiss: true,
    });
  };

  const CSVElement = memo(({ parentIndex, index }: { parentIndex: number; index: number }) => {
    function wrapWithQuote(value: AnyTodo) {
      const data = `${value.data}`.trim();
      return `"${data.replace(/"/g, ``).replace(/ /g, "")}"`;
    }

    return (
      <CSVParent className="csv">
        <CSVReader
          onDrop={(data) => {
            const newRules = [...rules];
            const d = data.map(wrapWithQuote).filter((i) => i !== `""`);
            const val = `[${d.join(",")}]`;

            if (parentIndex === -1) {
              newRules[index].value = val;
            } else {
              newRules[parentIndex].rules[index].value = val;
            }
            setRules(newRules);
          }}
          onError={handleOnError}
          noClick={false}
          noProgressBar
        >
          <span style={{ fontSize: 14 }}>Upload CSV file of values</span>
        </CSVReader>
      </CSVParent>
    );
  });

  const renderRuleItem = (data: AnyTodo, parentIndex: number, index: number) => {
    const joinValue = parentIndex === -1 ? rules[index].join : rules[parentIndex].rules[index].join;

    return (
      <StyledUl
        key={index} // TODO: Stop using index for key
        style={{
          justifyContent: "left",
          marginTop: 5,
          marginBottom: 10,
          marginLeft: parentIndex !== -1 ? 40 : 0,
          backgroundColor: "transparent",
          flexDirection: isWideScreen() ? "row" : "column",
        }}
      >
        <HorizontalSpace />
        <DropdownContainer
          actions={actions}
          checkpoint={checkpoint}
          checkpoints={checkpoints}
          data={data}
          getDescription={getDescription}
          handleDropdownClick={handleDropdownClick}
          index={index}
          IconArrow={IconArrow}
          isDemoMode={isDemoMode}
          isSuperAdmin={isSuperAdmin}
          jiraAPICall={jiraAPICall}
          lastRuleIndex={lastRuleIndex}
          parentIndex={parentIndex}
          organisation={organisation}
          organisations={organisations}
          reasonCodes={reasonCodes}
          reasonData={reasonData}
          renderDropDownItem={renderDropDownItem}
          rules={rules}
          rulesData={rulesData}
          selectedSection={selectedSection}
          selectedReasonSection={selectedReasonSection}
          setActions={setActions}
          setActionsData={setActionsData}
          setAssignedTo={setAssignedTo}
          setCheckpoint={setCheckpoint}
          setCustomFunctionIndexes={setCustomFunctionIndexes}
          setCustomRuleOption={setCustomRuleOption}
          setOrganisation={setOrganisation}
          setQueueData={setQueueData}
          setReasonCodes={setReasonCodes}
          setRiskLevel={setRiskLevel}
          setRiskValue={setRiskValue}
          setRules={setRules}
          setRulesData={setRulesData}
          setSelectedSection={setSelectedSection}
          setSelectedSubSections={setSelectedSubSections}
          setSelectedReasonSection={setSelectedReasonSection}
          setUsers={setUsers}
          setVisibleDropDown={setVisibleDropDown}
          subtype={DROPDOWN_TYPES.Operator}
          type={DROPDOWN_TYPES.Rules}
          visibleDropDown={visibleDropDown}
        />
        <HorizontalSpace />
        {!data[index].hasOperator ? null : (
          <Form.Control
            data-tid={`rule_helper_${index}_value`}
            style={{ width: isWideScreen() ? "20%" : "30%", height: 40 }}
            placeholder={data[index].sample.length === 0 ? "Value" : `e.g. ${data[index].sample}`}
            name="value"
            type="text"
            value={data[index].value}
            onChange={(event) => {
              const newRules = [...rules];
              if (parentIndex === -1) {
                newRules[index].value = event.target.value.trim();
              } else {
                newRules[parentIndex].rules[index].value = event.target.value.trim();
              }
              setRules(newRules);
            }}
            isInvalid={!isValidValue(parentIndex, index)}
          />
        )}
        {parentIndex === -1 && index === lastRuleIndex() ? (
          <>
            <SubmitButton
              data-tid="button_add_condition"
              type="submit"
              disabled={!isValidCondition(rules[lastRuleIndex()])}
              onClick={() => {
                setRules([...rules, getEmptyRuleClone()]);
              }}
              style={{
                margin: "0px 15px",
                backgroundColor: isValidCondition(rules[lastRuleIndex()]) ? "#2173FF" : "lightgrey",
                width: 150,
                height: 40,
              }}
            >
              <span>+ Add Condition</span>
            </SubmitButton>
            {[" in ", " not in "].includes(data[index].operator) ? <CSVElement parentIndex={parentIndex} index={index} /> : null}
          </>
        ) : index === data.length - 1 && parentIndex === -1 ? null : (
          <>
            <ToggleButtonGroup
              type="radio"
              name="options"
              style={{ marginLeft: 15, border: "1px solid #2173FF30", borderRadius: 6 }}
              defaultValue={data[index].join === "&&" ? 1 : 2}
              onClick={() => {
                const newRules = [...rules];
                if (parentIndex === -1) {
                  newRules[index].join = joinValue === "||" ? "&&" : "||";
                } else {
                  newRules[parentIndex].rules[index].join = joinValue === "||" ? "&&" : "||";
                }
                setRules(newRules);
              }}
            >
              <ToggleButton
                value={1}
                style={{
                  background: data[index].join === "&&" ? "#2173FF" : "#F8FBFF",
                  border: "none",
                  color: data[index].join === "&&" ? "#F8FBFF" : "#2173FF",
                }}
                data-tid={`rule_editor_and_button_${parentIndex + 1}_${index}`}
              >
                AND
              </ToggleButton>
              <ToggleButton
                value={2}
                style={{
                  background: data[index].join === "&&" ? "#F8FBFF" : "#2173FF",
                  border: "none",
                  color: data[index].join === "&&" ? "#2173FF" : "#F8FBFF",
                }}
                data-tid={`rule_editor_or_button_${parentIndex + 1}_${index}`}
              >
                OR
              </ToggleButton>
            </ToggleButtonGroup>
            {[" in ", " not in "].includes(data[index].operator) ? <CSVElement parentIndex={parentIndex} index={index} /> : null}
          </>
        )}
      </StyledUl>
    );
  };

  const renderEnvironment = () => (
    <StyledUl className="rule-environment" id="rule_environment" style={{ background: "transparent", justifyContent: "left" }}>
      <Title style={{ width: 180, marginLeft: 10, textAlign: "left" }}>Select Environment</Title>

      <RadioButton
        selected={environment === RULE_ENV_MODES.Live}
        title={RULE_ENV_MODES.Live}
        onClick={() => {
          setEnvironment(RULE_ENV_MODES.Live);
        }}
      />
      <HorizontalSpace />
      <RadioButton
        title={RULE_ENV_MODES.Shadow}
        selected={environment === RULE_ENV_MODES.Shadow}
        onClick={() => {
          setEnvironment(RULE_ENV_MODES.Shadow);
        }}
      />
    </StyledUl>
  );

  const renderChips = () => {
    const chips = actions.map((val) => (
      <ChipContainer className="rule-chip" id="rule_chip" key={`${val.key}`}>
        {val.key} : {val.value}{" "}
        <ChipCancelButton
          onClick={() => {
            setActions(actions.filter((e) => e.key !== val.key));
          }}
        >
          ×
        </ChipCancelButton>{" "}
      </ChipContainer>
    ));

    return <ChipWrapper> {chips} </ChipWrapper>;
  };

  const handleCustomAmmedment = (data: AnyTodo) => {
    if (customRuleOption === DROPDOWN_TYPES.Rules) {
      let newRulesData = rulesData.filter((e) => e.title !== ADD_CUSTOM);
      newRulesData = [...newRulesData, data, { title: ADD_CUSTOM, items: [] }];
      setRulesData(newRulesData);
    } else {
      let newReasonData = reasonData.filter((e) => e.title !== ADD_CUSTOM);
      newReasonData = [...newReasonData, data, { title: ADD_CUSTOM, items: [] }];
      setReasonData(newReasonData);
    }

    setCustomRuleOption("");
  };

  const renderRules = (ruleList: Rule[], parentIndex: number) => {
    const result = ruleList.map((r, index: number) => (
      <Container className="rule-item" id="rule_item" key={r.rule}>
        {parentIndex === -1 && ruleList.length > 1 && index === lastRuleIndex() ? <Line /> : null}
        {renderRuleItem(ruleList, parentIndex, index)}
        {r.rules.length > 0 && parentIndex < 1 ? renderRules(r.rules, index) : null}
        {parentIndex === -1 && index === lastRuleIndex() && ruleList[lastRuleIndex()].rule && (
          <DescriptionAndStats
            organisation={(organisation && organisation.name) || ""}
            rule={ruleList[lastRuleIndex()]}
            description={getDescription(parentIndex, index)}
          />
        )}
      </Container>
    ));

    return result;
  };

  const customFunctionAction = (d: FunctionData | undefined) => {
    if (customFunctionIndexes.length > 1) {
      const newRules = [...rules];
      const parentIndex = customFunctionIndexes[0];
      const index = customFunctionIndexes[1];

      if (d) {
        if (parentIndex === -1) {
          newRules[index].sample = d.data.sample;
          newRules[index].rule = d.value;
          newRules[index].datatype = d.data.dataType;
          newRules[index].hasOperator = d.data.hasOperator;
          newRules[index].operator = "";
          newRules[index].value = "";
        } else {
          newRules[parentIndex].rules[index].sample = d.data.sample;
          newRules[parentIndex].rules[index].rule = d.value;
          newRules[parentIndex].rules[index].datatype = d.data.dataType;
          newRules[parentIndex].rules[index].hasOperator = d.data.hasOperator;
          newRules[parentIndex].rules[index].operator = "";
          newRules[parentIndex].rules[index].value = "";
        }
      } else if (parentIndex === -1) {
        newRules[index].sample = "";
        newRules[index].rule = "";
      } else {
        newRules[parentIndex].rules[index].sample = "";
        newRules[parentIndex].rules[index].rule = "";
      }

      setRules(newRules);
      setCustomFunctionIndexes([]);
      setSelectedSection("");
    }
  };

  const isValidValue = (parentIndex: AnyTodo, index: AnyTodo) => {
    let ruleData: AnyTodo = {};
    if (parentIndex === -1) {
      ruleData = rules[index];
    } else {
      ruleData = rules[parentIndex].rules[index];
    }

    if (ruleData.value.length > 0) {
      if (ruleData.datatype === DATA_TYPES.bool && !["true", "false"].includes(ruleData.value)) {
        return false;
      }

      if (
        (ruleData.datatype === DATA_TYPES.int || ruleData.datatype === DATA_TYPES.float) &&
        Number.isNaN(parseInt(ruleData.value.replace(/\./g, "").replace(/\[/g, "").replace(/\]/g, ""), 10))
      ) {
        return false;
      }

      if (ruleData.datatype === DATA_TYPES.stringarray && !ruleData.value.includes("[")) {
        return false;
      }
    }

    return true;
  };

  const handleClickOutside = (event: AnyTodo) => {
    if (ref.current && !event.target.className.toString().includes("dropdown")) {
      setVisibleDropDown("");
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  return (
    <Layout>
      <FunctionsPopup
        show={selectedSection === FUNCTIONS}
        isDemoMode={isDemoMode}
        handleClose={() => {
          customFunctionAction(undefined);
        }}
        handleSubmit={(data) => {
          customFunctionAction(data);
        }}
        isSuperAdmin={isAdmin}
        organisation={organisation?.name}
      />
      <MainDiv style={{ width: "100%", backgroundColor: "transparent" }} ref={ref}>
        <StyledHeading
          style={{
            justifyContent: "space-between",
            display: "flex",
            marginBottom: 30,
            alignItems: "center",
          }}
        >
          <Title className="rule-editor-title" id="rule_editor_title" style={{ fontSize: 14 }}>
            {"Rules > Rule Editor"}
          </Title>
        </StyledHeading>
        <BackgroundBox style={{ margin: 25 }}>
          <StyledContainer>
            <GridList>
              {checkpoint === ADD_CUSTOM ? (
                <CustomInputWrapper
                  actionsData={actionsData}
                  checkpoints={checkpoints}
                  setActionsData={setActionsData}
                  setCheckpoint={setCheckpoint}
                  setCheckpoints={setCheckpoints}
                  setIsCustomAction={setIsCustomAction}
                  setRiskLevel={setRiskLevel}
                  setRiskValue={setRiskValue}
                  type={DROPDOWN_TYPES.Checkpoint}
                />
              ) : (
                <DropdownContainer
                  actions={actions}
                  checkpoint={checkpoint}
                  checkpoints={checkpoints}
                  data={undefined}
                  getDescription={getDescription}
                  handleDropdownClick={handleDropdownClick}
                  index={undefined}
                  IconArrow={IconArrow}
                  isDemoMode={isDemoMode}
                  isSuperAdmin={isSuperAdmin}
                  jiraAPICall={jiraAPICall}
                  lastRuleIndex={lastRuleIndex}
                  parentIndex={undefined}
                  organisation={organisation}
                  organisations={organisations}
                  reasonCodes={reasonCodes}
                  reasonData={reasonData}
                  renderDropDownItem={renderDropDownItem}
                  rules={rules}
                  rulesData={rulesData}
                  selectedSection={selectedSection}
                  selectedReasonSection={selectedReasonSection}
                  setActions={setActions}
                  setActionsData={setActionsData}
                  setAssignedTo={setAssignedTo}
                  setCheckpoint={setCheckpoint}
                  setCustomFunctionIndexes={setCustomFunctionIndexes}
                  setCustomRuleOption={setCustomRuleOption}
                  setOrganisation={setOrganisation}
                  setQueueData={setQueueData}
                  setReasonCodes={setReasonCodes}
                  setRiskLevel={setRiskLevel}
                  setRiskValue={setRiskValue}
                  setRules={setRules}
                  setRulesData={setRulesData}
                  setSelectedSection={setSelectedSection}
                  setSelectedSubSections={setSelectedSubSections}
                  setSelectedReasonSection={setSelectedReasonSection}
                  setUsers={setUsers}
                  setVisibleDropDown={setVisibleDropDown}
                  subtype=""
                  type={DROPDOWN_TYPES.Checkpoint}
                  visibleDropDown={visibleDropDown}
                />
              )}

              {isAdmin ? (
                <Container style={{ marginLeft: isWideScreen() ? 10 : 0 }}>
                  <StyledSubHeading
                    className="rule-editor-rule-name-title"
                    id="rule_editor_rule_name_title"
                    style={{ fontWeight: 600, marginBottom: 23 }}
                  >
                    Organization
                  </StyledSubHeading>
                  <OrganisationDropDown organisation={organisation?.name || "all"} changeOrganisation={changeOrganisation} />
                </Container>
              ) : null}

              <Container style={{ marginLeft: isWideScreen() ? 20 : 0 }}>
                <StyledSubHeading
                  className="rule-editor-rule-name-title"
                  id="rule_editor_rule_name_title"
                  style={{ fontWeight: 600 }}
                >
                  Rule Name
                </StyledSubHeading>
                <StyledInput
                  className="rule-name"
                  id="rule_name"
                  placeholder="Name"
                  name="name"
                  type="text"
                  value={name}
                  style={{ width: "100%", height: 40 }}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                />
              </Container>
            </GridList>
            {isSuperAdmin && (
              <div>
                <Button
                  onClick={calculatePerfBasedOnPast}
                  id="calculate_perf_based_on_past_data"
                  style={{ height: 40, marginTop: 10 }}
                >
                  Calculate performance based on past data
                </Button>
              </div>
            )}
            <BackgroundBox
              style={{
                border: "1px solid rgba(0, 0, 0, 0.1)",
                marginTop: 20,
                marginBottom: 20,
                maxWidth: isWideScreen() ? "80%" : "100%",
                minWidth: "60%",
                boxShadow: "none",
              }}
            >
              <StyledUl
                style={{
                  justifyContent: "space-between",
                  backgroundColor: "transparent",
                  marginRight: 20,
                }}
              >
                <StyledSubHeading
                  className="rule-editor-rule-helper-title"
                  id="rule_editor_rule_helper_title"
                  style={{ margin: 20, color: "#001932", fontWeight: 600 }}
                >
                  Rule Helper
                </StyledSubHeading>
                <LinkToDictionary
                  title="List of available fields"
                  icon={infoIcon}
                  style={{ backgroundColor: "#F8FBFF", width: 200 }}
                  isDemoMode={isDemoMode}
                />
              </StyledUl>
              <RuleOutputContainer>
                <RuleOutputTitle>
                  <span className="rule-editor-rule-output-label" id="rule_editor_rule_output_label" style={{ width: 80 }}>
                    Output:
                  </span>
                  <StyledSubHeading className="rule-output" id="rule_output" style={{ fontWeight: 400, fontSize: 14 }}>
                    {getFinalRule(false)}
                  </StyledSubHeading>
                </RuleOutputTitle>
              </RuleOutputContainer>

              {isSuperAdmin && (
                <>
                  <Form.Check
                    className="rule-editor-check-batch-mode"
                    id="rule_editor_check_batch_mode"
                    label={
                      <StyledSubHeading style={{ fontWeight: 500, margin: 0 }}>Enable batch mode for this rule?</StyledSubHeading>
                    }
                    name="check-cm"
                    checked={enableBatchMode}
                    style={{ margin: 20 }}
                    onChange={() => {
                      setEnableBatchMode(!enableBatchMode);
                      if (!enableBatchMode) {
                        setBatchRuleData(undefined);
                      }
                    }}
                  />
                  {enableBatchMode && <BatchRuleView data={batchRuleData} onDataChanged={(val) => setBatchRuleData(val)} />}
                </>
              )}

              {renderRules(rules, -1)}
            </BackgroundBox>

            {customRuleOption === DROPDOWN_TYPES.Rules ? (
              <CustomRule
                submitCallback={(data: AnyTodo) => handleCustomAmmedment(data)}
                cancelCallback={() => {
                  setCustomRuleOption("");
                }}
              />
            ) : null}

            {!isSuperAdmin ? null : (
              <BackgroundBox
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  marginTop: 20,
                  marginBottom: 20,
                  maxWidth: isWideScreen() ? "80%" : "100%",
                  minWidth: "60%",
                  boxShadow: "none",
                }}
              >
                <StyledSubHeading style={{ margin: 15, fontWeight: 600 }}>Reason Code Helper</StyledSubHeading>
                <StyledArea
                  className="rule-editor-reason-code-helper"
                  id="rule_editor_reason_code_helper"
                  placeholder="Type here"
                  name="reasonCode"
                  style={{
                    width: isWideScreen() ? "50%" : "60%",
                    marginLeft: 20,
                  }}
                  value={reasonCodes}
                  onChange={(event) => {
                    setReasonCodes(event.target.value);
                  }}
                />
              </BackgroundBox>
            )}

            <StyledSubHeading style={{ marginTop: 10, fontWeight: 600 }}>Action</StyledSubHeading>
            {renderChips()}
            {renderActions()}
            <br />
            <br />
            <StyledArea
              className="rule-description"
              id="rule_description"
              placeholder="Description"
              name="description"
              value={description}
              style={{ width: isWideScreen() ? "40%" : "60%" }}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
            <br />

            {renderEnvironment()}

            {![CHECK_POINTS.Devices as string].includes(checkpoint.toLowerCase()) && clientId !== RULE_ADMIN_CLIENT_ID && (
              <Container style={{ paddingTop: 20 }}>
                <Form.Check
                  className="rule-editor-check-case-management"
                  id="rule_editor_check_case_management"
                  label={
                    <StyledSubHeading style={{ fontWeight: 500, margin: 0 }}>
                      Enable case management for this rule?
                    </StyledSubHeading>
                  }
                  name="check-cm"
                  checked={enableCaseManagement}
                  onChange={() => {
                    const updatedValue = !enableCaseManagement;
                    if (!updatedValue) {
                      setQueue(undefined);
                      setAssignedTo(undefined);
                    }
                    setEnableCaseManagement(updatedValue);
                  }}
                />
              </Container>
            )}

            {enableCaseManagement ? (
              <QueueSection
                queue={queue}
                user={assignedTo}
                users={users}
                queues={queueData}
                jiraData={orgJiraData}
                jiraEnabled={queue && queue.jira_enabled}
                onJiraitemsChange={(data) => {
                  setJiraData(data);
                }}
                onQueueSelected={(selectedQueue, selectedUser) => {
                  const newQueue = {
                    ...selectedQueue,
                    organisation: organisation ? organisation.name : "",
                    checkpoint,
                  };

                  setQueue(newQueue);
                  if (selectedUser) {
                    setAssignedTo(selectedUser);
                  }
                  if (newQueue.id === "") {
                    setQueueData([...queueData, newQueue]);
                  }
                }}
              />
            ) : null}

            {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}
            <StyledUl
              style={{
                justifyContent: "left",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <SubmitButton
                className="button-submit-rule"
                id="button_submit_rule"
                type="submit"
                style={{ width: 180 }}
                onClick={onSubmitAction}
              >
                {apiInvoking ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  <span>+ Submit rule</span>
                )}
              </SubmitButton>
              <SubmitButton
                className="button-cancel"
                id="button_cancel"
                style={{
                  marginLeft: 5,
                  width: 130,
                  backgroundColor: "transparent",
                }}
                onClick={() => {
                  navigate("/rules"); // navigate(-1) might be better. Passing the previous page path as a prop might be a good solution. Needs further consideration.
                }}
              >
                <span style={{ color: "#2173FF" }}>Cancel</span>
              </SubmitButton>
            </StyledUl>
          </StyledContainer>
        </BackgroundBox>
      </MainDiv>
    </Layout>
  );
};
export default ManageRule;
