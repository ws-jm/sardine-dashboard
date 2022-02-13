import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import { getErrorMessage } from "utils/errorUtils";
import moment from "moment";
import DatePicker from "react-datepicker";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import { StoreCtx } from "../../utils/store";
import OrganisationDropDown from "../Dropdown/OrganisationDropDown";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import { ActionTypes } from "../../utils/store/actionTypes";
import { StyledMainDiv, BackgroundBox, StyledContainer, DropDownContent, HorizontalSpace, StyledUl } from "./styles";
import RadioButton from "../Common/RadioButton";
import icAdd from "../../utils/logo/add.svg";
import icDelete from "../../utils/logo/delete.svg";
import icCalendar from "../../utils/logo/calendar.svg";
import { addBlocklist, addAllowlist, updateBlocklist, updateAllowlist } from "../../utils/api";
import { ErrorText } from "../RulesModule/styles";
import { BlockAllowlistProps } from "../../utils/store/interface";
import { BlocklistProps } from "./RowItem";

interface IFieldProps {
  isLast: boolean;
  index: number;
  value: string;
}

interface IStateProps {
  list: BlockAllowlistProps;
  details: BlocklistProps;
}

const blocklist = "Blocklist";
const allowlist = "Allowlist";
const actionTypes = [blocklist, allowlist];
const fieldTypes: { [key: string]: string[] } = {
  Blocklist: ["Email", "Phone", "Customer ID", "Tax ID", "Device ID", "IP"].sort(),
  Allowlist: ["Email", "Customer ID", "Device ID"].sort(),
};
const scopeTypes = ["Field level", "Transaction level"];
const labelToDBField: { [key: string]: string } = {
  Email: "email",
  Phone: "phone",
  "Customer ID": "user_id",
  "Tax ID": "tax_id",
  "Device ID": "device_id",
  IP: "device_ip",
  "Wallet Address": "wallet_address",
};

export const convertType = (value: string, isForDB: boolean) => {
  if (isForDB) {
    return labelToDBField[value] || "";
  }
  return Object.keys(labelToDBField).find((k) => labelToDBField[k] === value) || "";
};

export const defaultBlocklistExpiry = moment().add(2, "years").toDate();
export const defaultAllowlistExpiry = moment().add(2, "months").toDate();

const AddNew = () => {
  const { dispatch } = useContext(StoreCtx);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedField, setSelectedField] = useState("");
  const [selectedScope, setSelectedScope] = useState(scopeTypes[1]);
  const [actionType, setActionType] = useState(blocklist);

  const { organisationFromUserStore, isAdmin, setUserStoreOrganisation } = useUserStore((state) => {
    const { organisation, setUserStoreOrganisation } = state;
    return {
      organisationFromUserStore: organisation,
      isAdmin: selectIsAdmin(state),
      setUserStoreOrganisation,
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [fieldsValue, setFieldsValue] = useState([""]);
  const [selectedDate, setSelectedDate] = useState(defaultBlocklistExpiry);
  const [error, setError] = useState("");
  const [organisation, setOrganisation] = useState(organisationFromUserStore);

  const pageState = location.state as IStateProps;
  const listData = pageState ? pageState.list : undefined;
  const details = pageState ? pageState.details : undefined;

  useEffect(() => {
    if (details) {
      setActionType(details.isBlocklist || false ? blocklist : actionTypes[1]);
      setSelectedScope(details.scope);
      setSelectedField(convertType(details.type, false));
      setSelectedDate(moment(details.expiry).toDate());
      setFieldsValue([details.value]);
    }

    if (listData && listData?.organisation) {
      if (listData.organisation !== "all") {
        setOrganisation(listData!.organisation);
      }
    }
  }, [details, listData]);

  window.onpopstate = () => {
    if (listData) {
      dispatch({ type: ActionTypes.BLOCK_LIST, payload: listData });
    }
  };

  const changeOrganisation = (organisationName: string) => {
    setOrganisation(organisationName);
    setUserStoreOrganisation(organisationName);

    if (listData && listData?.organisation) {
      listData.organisation = organisationName;
    }
  };

  const addNewRecord = async () => {
    setIsLoading(true);
    setError("");
    const payload = {
      organisation,
      data: fieldsValue.map((f) => ({
        type: convertType(selectedField, true),
        value: f,
      })),
      scope: "transaction", // TODO: Change when support scope level block-allowlist
      expiry: selectedDate.toDateString(),
    };

    try {
      if (actionType === blocklist) await addBlocklist(payload);
      else await addAllowlist(payload);

      if (listData) {
        listData!.shouldRefresh = true;
      }
      navigate(-1);
    } catch (e) {
      setIsLoading(false);
      setError(getErrorMessage(e));
    }
  };

  const updateRecord = async () => {
    setIsLoading(true);
    setError("");

    const payload = {
      id: details?.id || "",
      organisation,
      type: convertType(selectedField, true),
      value: fieldsValue[0],
      scope: "transaction", // TODO: Change when support scope level block-allowlist
      expiry: selectedDate.toDateString(),
    };

    try {
      if (actionType === blocklist) await updateBlocklist(payload);
      else await updateAllowlist(payload);

      if (listData) {
        listData!.shouldRefresh = true;
      }
      navigate(-1);
    } catch (e) {
      setIsLoading(false);
      setError(getErrorMessage(e));
    }
  };

  const ValueField = (p: IFieldProps) => {
    const { value, index, isLast } = p;
    return (
      <div style={{ display: "flex", marginBottom: 10 }}>
        <Form.Control
          type="text"
          name="value"
          value={value}
          placeholder={selectedField.length > 0 ? `Type ${selectedField.toLowerCase()} value` : "Type here"}
          style={{ height: 36, marginRight: 10 }}
          onChange={(event) => {
            const arr = [...fieldsValue];
            arr[index] = event.target.value.trim();
            setFieldsValue(arr);
          }}
        />
        {details ? null : (
          <Button
            onClick={() => {
              if (p.index === fieldsValue.length - 1) {
                setFieldsValue([...fieldsValue, ""]);
              } else {
                const arr = [...fieldsValue];
                arr.splice(p.index, 1);
                setFieldsValue(arr);
              }
            }}
            style={{ backgroundColor: "#F8FBFF", border: "none" }}
          >
            <img alt="" src={isLast ? icAdd : icDelete} />
          </Button>
        )}
      </div>
    );
  };

  const isValid = () =>
    fieldsValue.filter((f) => f.length === 0).length === 0 && selectedField.length > 0 && selectedScope.length > 0;

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="device-info" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName> Manage Blocklist/Allowlist</StyledTitleName>
          </StyledNavTitle>
        </StyledStickyNav>
        <StyledContainer>
          <BackgroundBox>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "70%", margin: 20 }}>
                <div style={{ width: "fit-content", marginBottom: 30 }}>
                  {isAdmin && !details && (
                    <>
                      <StyledTitleName style={{ marginBottom: 10 }}> Organization</StyledTitleName>
                      <div style={{ zIndex: 20, marginBottom: 20, marginLeft: -20 }}>
                        <OrganisationDropDown organisation={organisation} changeOrganisation={changeOrganisation} />
                      </div>
                    </>
                  )}
                  <StyledTitleName> Type</StyledTitleName>
                  {actionTypes.map((a) => (
                    <RadioButton
                      selected={actionType === a}
                      title={a}
                      isDisabled={details !== undefined}
                      style={{ minWidth: 140 }}
                      onClick={() => {
                        setActionType(a);
                        if (a === blocklist) {
                          setSelectedDate(defaultBlocklistExpiry);
                        } else {
                          setSelectedDate(defaultAllowlistExpiry);
                        }
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex" }}>
                  <div style={{ width: "40%", marginBottom: 30, marginRight: 20 }}>
                    <StyledTitleName> Select field type</StyledTitleName>
                    {fieldTypes[actionType].map((f) => (
                      <RadioButton
                        selected={selectedField === f}
                        title={f}
                        onClick={() => {
                          setSelectedField(f);
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      width: 1,
                      backgroundColor: "#EAEDF2",
                      marginLeft: 30,
                      marginRight: 30,
                    }}
                  />
                  <div style={{ width: "40%", marginBottom: 20, marginRight: 20 }}>
                    {fieldsValue.map((f, index) =>
                      ValueField({
                        index,
                        value: f,
                        isLast: index === fieldsValue.length - 1,
                      })
                    )}
                  </div>
                </div>

                <div style={{ width: "35%", marginBottom: 30, display: "none" }}>
                  <StyledTitleName> Scope</StyledTitleName>
                  {scopeTypes.map((s) => (
                    <RadioButton
                      selected={selectedScope === s}
                      title={s}
                      onClick={() => {
                        setSelectedScope(s);
                      }}
                    />
                  ))}
                </div>

                <div style={{ width: "35%", marginBottom: 30 }}>
                  <StyledTitleName> Expiry Date</StyledTitleName>
                  <Button
                    onClick={() => {
                      setIsDropdownVisible(!isDropdownVisible);
                    }}
                    style={{
                      marginTop: 10,
                      backgroundColor: "#F8FBFF",
                      border: "none",
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ color: "#325078" }}>{moment(selectedDate).format("MM-DD-YYYY")}</div>
                    <img alt="" src={icCalendar} />
                  </Button>
                  <DropDownContent
                    style={{
                      display: isDropdownVisible ? "block" : "none",
                      width: "max-content",
                      background: "#ffffff",
                    }}
                  >
                    <DatePicker
                      onChange={(dates: Date | [Date | null, Date | null] | null) => {
                        if (dates === null) {
                          return;
                        }
                        if (!Array.isArray(dates) && dates !== null) {
                          setSelectedDate(dates);
                          setIsDropdownVisible(false);
                        }
                      }}
                      selected={selectedDate}
                      minDate={new Date()}
                    />
                  </DropDownContent>
                </div>
              </div>
            </div>
            {error.length > 0 ? <ErrorText style={{ textTransform: "capitalize" }}>{error}</ErrorText> : null}
            <StyledUl
              style={{
                backgroundColor: "transparent",
                justifyContent: "flex-end",
                marginBottom: 20,
              }}
            >
              <Button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#2173FF",
                  marginRight: 20,
                }}
                onClick={() => {
                  navigate(-1);
                }}
              >
                Cancel
              </Button>
              <Button
                style={{ backgroundColor: isValid() ? "#2173FF" : "lightgrey", color: isValid() ? "white" : "grey" }}
                disabled={!isValid()}
                onClick={details ? updateRecord : addNewRecord}
              >
                {isLoading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  <span>+ Save details</span>
                )}
              </Button>
            </StyledUl>
          </BackgroundBox>
          <HorizontalSpace style={{ marginTop: 50 }} />
        </StyledContainer>
      </StyledMainDiv>
    </Layout>
  );
};

export default AddNew;
