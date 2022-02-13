import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormControl, Image } from "react-bootstrap";
import { SortableContainer, SortEndHandler } from "react-sortable-hoc";
import { useToasts } from "react-toast-notifications";
import {
  AnyTodo,
  CHECKPOINTS as CHECK_POINTS,
  Rule,
  RuleExpression,
  RULE_ENV_MODES,
} from "sardine-dashboard-typescript-definitions";
import { captureException } from "utils/errorUtils";
import downArrow from "utils/logo/down.svg";
import { useUpdateUrlParams } from "hooks/UseUpdateUrlParams";
import { CLIENT_QUERY_FIELD } from "utils/constructFiltersQueryParams";
import { useSearchQuery } from "hooks/useSearchQuery";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../components/Layout/Main";
import Loader from "../components/Common/Loader";
import { sortRules } from "../utils/api";
import { replaceAllSpacesWithUnderscores } from "../utils/stringUtils";
import {
  StyledTable,
  BackgroundBox,
  Title,
  StyledTh,
  StyledContainer,
  HorizontalContainer,
  HorizontalSpace,
  Container,
  Dropbtn,
  DropDownContent,
  SubDropbtn,
  StyledUl,
  SortBtn,
} from "../components/RulesModule/styles";
import { RuleItem, SortableItem } from "../components/RulesModule/RuleItem";
import { isWideScreen } from "../utils/dataProviderUtils";
import { CHECKPOINT_QUERY_FIELD, QUERY_STATUS } from "../constants";
import { MANAGE_RULE, RULE_DETAILS_PATH, SEARCH_PARAM_KEYS } from "../modulePaths";
import { useClientIdFetchResult, useRulesFetchResult, useOrganizationNamesResult } from "../hooks/fetchHooks";

interface Organisation {
  name: string;
}

const PARAM_KEYS = SEARCH_PARAM_KEYS[RULE_DETAILS_PATH];
const HEADERS = ["RULE ID", "RULE NAME", "CONDITION", "ACTION", "ENV"] as const;
const CHECKPOINTS = [
  { name: CHECK_POINTS.ACH },
  { name: CHECK_POINTS.AML },
  { name: CHECK_POINTS.AMLBank },
  { name: CHECK_POINTS.AMLIssuer },
  { name: CHECK_POINTS.AMLCrypto },
  { name: CHECK_POINTS.Customer },
  { name: CHECK_POINTS.Devices },
  { name: CHECK_POINTS.Login },
  { name: CHECK_POINTS.Onboarding },
  { name: CHECK_POINTS.Payment },
  { name: CHECK_POINTS.Withdrawal },
  { name: CHECK_POINTS.IssuingRisk },
] as const;
const DROPDOWN_TYPE = {
  CheckPoint: "checkPoint",
  Organisations: "organisations",
} as const;

type DropdownType = typeof DROPDOWN_TYPE[keyof typeof DROPDOWN_TYPE];

const SortableList = SortableContainer(
  ({
    rules,
    isSorting,
    checkpoint,
    organisation,
  }: {
    rules: RuleExpression[];
    isSorting: boolean;
    checkpoint: string | null;
    organisation: string | null;
  }) => {
    const navigate = useNavigate();
    return (
      <StyledTable id="rules_list">
        <thead style={{ height: 40, border: 5 }}>
          <tr>
            {HEADERS.map((ele, eleIndex) => (
              <StyledTh
                className={`rules-list-header-${ele}`}
                id={`rules_list_header_${ele}`}
                style={{ textAlign: "left", width: eleIndex === 1 ? "20%" : "auto", backgroundColor: "#F7F9FC", minWidth: 80 }}
                key={ele}
              >
                {ele}
              </StyledTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.length > 0 &&
            rules.map((rule: RuleExpression, index: number) =>
              isSorting ? (
                <SortableItem key={rule.id} index={index} ruleExpression={rule} />
              ) : (
                <RuleItem
                  key={rule.id}
                  ruleExpression={rule}
                  onClick={() => {
                    if (!checkpoint) {
                      alert("Please select any checkpoint");
                    } else if (rules.length > index) {
                      const search = `${PARAM_KEYS.RULE_ID}=${encodeURIComponent(rule.id)}&${PARAM_KEYS.ORG}=${encodeURIComponent(
                        organisation || ""
                      )}`;
                      navigate(
                        { pathname: RULE_DETAILS_PATH, search },
                        {
                          // TODO: Stop using state in react-router. It is not typed and can cause issues.
                          state: { details: { ...rule, organisation, checkpoint } },
                        }
                      );
                    }
                  }}
                />
              )
            )}
        </tbody>
      </StyledTable>
    );
  }
);

const DropDownContainer = ({
  type,
  organisation,
  organisations,
  checkpoint,
  setIsSorting,
}: {
  type: DropdownType;
  organisation: string | null;
  organisations: Organisation[];
  checkpoint: string | null;
  setIsSorting: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const [visibleDropDown, setVisibleDropDown] = useState<string>("");
  const refOrgSearch = useRef(null);
  const updateUrlParams = useUpdateUrlParams();

  const [organisationSearch, setOrganisationSearch] = useState("");

  const handleDropdownClick = (dropdowntype: DropdownType) => {
    const val = dropdowntype === visibleDropDown ? "" : dropdowntype;
    setVisibleDropDown(val);
  };

  const getDropdownTitle = (dropdownType: DropdownType) => {
    if (dropdownType === DROPDOWN_TYPE.Organisations) {
      return organisation ? organisation.toUpperCase() : "Organization";
    }
    return checkpoint?.toUpperCase() || "Check Point";
  };

  const renderDropDown = (dropdownType: DropdownType) => {
    const data =
      dropdownType === DROPDOWN_TYPE.Organisations
        ? organisations.filter((org) => org.name.toLowerCase().includes(organisationSearch.toLowerCase()))
        : CHECKPOINTS;
    return data.map((element) => (
      <Container key={element.name}>
        <SubDropbtn
          onClick={() => {
            if (dropdownType === DROPDOWN_TYPE.Organisations) {
              updateUrlParams(CLIENT_QUERY_FIELD, element.name);
            } else {
              updateUrlParams(CHECKPOINT_QUERY_FIELD, element.name);
            }
            setVisibleDropDown("");
            setIsSorting(false);
          }}
        >
          <Title
            className={`rules-list-dropdown-${dropdownType}-name`}
            id={`rules_list_dropdown_${replaceAllSpacesWithUnderscores(element.name)}_name`}
            style={{ width: 180, textAlign: "left" }}
          >
            {element.name.toUpperCase()}
          </Title>
        </SubDropbtn>
      </Container>
    ));
  };

  return (
    <Container className={`rules-list-dropdown-${type}-container`} id={`rules_list_dropdown_${type}_container`}>
      <Dropbtn
        className={`rules-list-dropdown-button-${type}`}
        id={`rules_list_dropdown_button_${type}`}
        style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", height: 40, alignItems: "center" }}
        onClick={() => handleDropdownClick(type)}
      >
        {getDropdownTitle(type)}
        <Image src={downArrow} style={{ marginLeft: 10, width: 12, height: 12, alignSelf: "center" }} />
      </Dropbtn>
      <DropDownContent
        className={`rules-list-dropdown-content-${type}`}
        id={`rules_list_dropdown_content_${type}`}
        style={{ display: visibleDropDown === type ? "block" : "", width: 200, maxHeight: 300, overflowY: "scroll" }}
      >
        {type === DROPDOWN_TYPE.Organisations ? (
          <FormControl
            className={`rules-list-dropdown-${type}-search`}
            id={`rules_list_dropdown_${type}_search`}
            ref={refOrgSearch}
            type="text"
            value={organisationSearch}
            placeholder="Search"
            onChange={(event) => {
              const text = event.target.value;
              setOrganisationSearch(text);
              setTimeout(() => {
                (refOrgSearch as AnyTodo).current.focus();
              }, 50);
            }}
          />
        ) : null}
        {renderDropDown(type)}
      </DropDownContent>
    </Container>
  );
};

const Rules = (): JSX.Element => {
  const navigate = useNavigate();
  const queries = useSearchQuery();
  const organisation = queries.get(CLIENT_QUERY_FIELD);

  const checkpoint = queries.get(CHECKPOINT_QUERY_FIELD);
  const updateUrlParams = useUpdateUrlParams();
  const { addToast } = useToasts();
  const [rulesHolder, setRulesHolder] = useState<RuleExpression[]>([]);
  const [rules, setRules] = useState<RuleExpression[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [isSorting, setIsSorting] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const { isAdmin, organisationFromUserStore } = useUserStore((state) => {
    const { setUserStoreOrganisation, organisation: org } = state;

    return {
      isAdmin: selectIsAdmin(state),
      setUserStoreOrganisation,
      organisationFromUserStore: org,
    };
  });

  const organizationNamesResult = useOrganizationNamesResult({ enabled: isAdmin });

  const clientIdResult = useClientIdFetchResult({ organisation: organisation || "", enabled: organisation !== null });

  const rulesResult = useRulesFetchResult({
    clientId: clientIdResult.data || "",
    checkpoint: checkpoint || "",
    orgName: organisation || "",
    enabled: clientIdResult.status === QUERY_STATUS.SUCCESS && !!clientIdResult.data && checkpoint !== null,
  });

  const prepareRulesFromData = (data: Rule[]) => {
    const ruleList: RuleExpression[] = data
      ? data.map((r) => ({
          env: r.isShadow ? RULE_ENV_MODES.Shadow : RULE_ENV_MODES.Live,
          ...r,
        }))
      : [];

    setRules(ruleList);
    setRulesHolder(ruleList);
    setIsLoadingRules(false);
  };

  useEffect(() => {
    if (clientIdResult.error !== null) {
      addToast("Failed to fetch the client ID", {
        appearance: "error",
        autoDismiss: true,
      });
      captureException(clientIdResult.error);
    }
  }, [clientIdResult.error, addToast]);

  useEffect(() => {
    if (rulesResult.error !== null) {
      addToast("Failed to fetch the client ID", {
        appearance: "error",
        autoDismiss: true,
      });
      captureException(rulesResult.error);
    }
  }, [rulesResult.error, addToast]);

  useEffect(() => {
    if (rulesResult.data === undefined) {
      setRules([]);
      setRulesHolder([]);
    } else {
      prepareRulesFromData(rulesResult.data);
    }
  }, [rulesResult.data]);

  useEffect(() => {
    if (organizationNamesResult.data === undefined) {
      setOrganisations([]);
    } else {
      setOrganisations(organizationNamesResult.data);
    }
  }, [organizationNamesResult.data]);

  useEffect(() => {
    if (organisationFromUserStore && !isAdmin && organisation === null) {
      updateUrlParams(CLIENT_QUERY_FIELD, organisationFromUserStore);
    }
  }, [organisation, organisations, isAdmin]);

  const onSortEnd: SortEndHandler = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    const newRules = [...rules];
    const temp = newRules[oldIndex];
    newRules[oldIndex] = newRules[newIndex];
    newRules[newIndex] = temp;
    setRules(newRules);
    setRulesHolder(newRules);
  };

  const sortRulesAction = async () => {
    if (isSorting && clientIdResult.data) {
      const payload = {
        order: rules.map((r) => r.id),
        clientID: clientIdResult.data,
        checkpoint,
      };

      try {
        await sortRules(payload, String(organisation));
        addToast("Sorted successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (reason) {
        addToast(`Failed to sort: ${reason}`, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } else if (organisation && !organisation.toLowerCase().includes("sardine")) {
      const data = rules.filter((r) => r.isEditable === true);
      setRules(data);
    }
    setIsSorting(!isSorting);
  };

  const isHtmlElement = (elem: Element): elem is HTMLElement => elem instanceof HTMLElement;

  // TODO: Stop using the old code. This function depends on the HTML structure
  // and assume that the HTML structure is not going to change.
  const exportCSVAction = (): void => {
    const rows = document.querySelectorAll("table#rules_list tr");
    const csv = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = [];
      const cols = rows[i].querySelectorAll("td, th");
      for (let j = 0; j < cols.length; j += 1) {
        const elem = cols[j];
        if (isHtmlElement(elem)) {
          let data = elem.innerText.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
          data = data.replace(/"/g, '""');
          row.push(`"${data}"`);
        }
      }
      csv.push(row.join(","));
    }
    const csvString = csv.join("\n");
    const filename = `${checkpoint}_rules_list_${new Date().toLocaleDateString()}.csv`;
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = () => {
    const text = searchString.trim().toLowerCase();
    const data = [...rulesHolder];
    if (text.length === 0) {
      setRules(data);
    } else if (data.length > 0) {
      setRules(
        data.filter(
          (d) =>
            d.name.toLowerCase().includes(text) || d.condition.toLowerCase().includes(text) || d.env.toLowerCase().includes(text)
        )
      );
    }
  };

  return (
    <Layout>
      <>
        <StyledUl
          style={{
            alignItems: "center",
            backgroundColor: "transparent",
            marginTop: 10,
          }}
        />
        <StyledUl
          style={{
            justifyContent: "space-between",
            backgroundColor: "transparent",
            margin: "50px 50px 0px",
          }}
        >
          <Title className="title-rules-listing" id="title_rules_listing">
            RULE LISTING
          </Title>
          <Button
            className="button-add-new-rule"
            id="button_add_new_rule"
            style={{ backgroundColor: "#2173FF" }}
            onClick={() => {
              navigate(MANAGE_RULE);
            }}
          >
            {" "}
            + Add New Rule{" "}
          </Button>
        </StyledUl>
        {isLoadingRules ? (
          <Loader />
        ) : (
          <StyledContainer>
            <BackgroundBox>
              <HorizontalContainer
                style={{
                  marginTop: 20,
                  flexDirection: window.screen.width < 760 ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <FormControl
                  className="rules-list-search"
                  id="rules_list_search"
                  type="text"
                  placeholder="Search here"
                  style={{ width: isWideScreen() ? 300 : 200, marginLeft: 30 }}
                  onChange={(event) => {
                    const text = event.target.value;
                    setSearchString(text);
                    if (text.length === 0) {
                      setRules(rulesHolder);
                    } else {
                      handleSearch();
                    }
                  }}
                />
                <StyledUl style={{ justifyContent: "flex-end" }}>
                  <DropDownContainer
                    type={DROPDOWN_TYPE.CheckPoint}
                    organisation={organisation}
                    organisations={organisations}
                    checkpoint={checkpoint}
                    setIsSorting={setIsSorting}
                  />
                  <HorizontalSpace />
                  {isAdmin ? (
                    <DropDownContainer
                      type={DROPDOWN_TYPE.Organisations}
                      organisation={organisation}
                      organisations={organisations}
                      checkpoint={checkpoint}
                      setIsSorting={setIsSorting}
                    />
                  ) : null}
                  <HorizontalSpace style={{ marginRight: 10 }} />
                  {rules.length > 0 ? (
                    <>
                      {isAdmin || rules.filter((r) => r.isEditable === true).length > 1 ? (
                        <SortBtn className="rules-list-sort-button" id="rules_list_sort_button" onClick={sortRulesAction}>
                          {isSorting ? "Save" : "Sort Rules"}
                        </SortBtn>
                      ) : null}
                      <SortBtn className="rules-list-export-button" id="rules_list_export_button" onClick={exportCSVAction}>
                        Export CSV
                      </SortBtn>
                    </>
                  ) : null}
                </StyledUl>
              </HorizontalContainer>
              <div style={{ padding: "30px 50px 50px 30px", overflowX: "scroll" }}>
                {rules.length > 0 ? (
                  <SortableList
                    onSortEnd={onSortEnd}
                    useDragHandle
                    rules={rules}
                    organisation={organisation}
                    checkpoint={checkpoint}
                    isSorting={isSorting}
                  />
                ) : (
                  <Title
                    className="rules-list-no-rules"
                    id="rules_list_no_rules"
                    style={{ margin: 30, width: "40%", marginLeft: 50 }}
                  >
                    No Rules Available!
                  </Title>
                )}
              </div>
            </BackgroundBox>
            <HorizontalSpace style={{ marginTop: 50 }} />
          </StyledContainer>
        )}
      </>
    </Layout>
  );
};
export default Rules;
