import React, { useState } from "react";
import { Modal, Button, FormControl } from "react-bootstrap";
import { replaceAll } from "utils/stringUtils";
import { Title, StyledUl } from "./styles";
import {
  getRulesData,
  CHECK_POINTS,
  supportedFunctions,
  FUNCTIONS,
  ItemModel,
  FunctionChild,
  DATA_TYPES,
  MULTI_FEATURE_FUNCTIONS,
} from "../../utils/dataProviderUtils";
import RecursiveDropdown, { DataProps } from "../Common/RecursiveDropdown";

interface Props {
  show: boolean;
  isDemoMode: boolean;
  isSuperAdmin: boolean;
  handleClose: () => void;
  organisation?: string;
  handleSubmit: (data: FunctionData) => void;
}

export interface FunctionData {
  value: string;
  data: FunctionChild;
}

const DROPDOWN_TYPE = {
  Functions: "Functions",
  Feature1: "Feature 1",
  Feature2: "Feature 2",
} as const;

export const getSampleValue = (sec: string, value: string): { sample: string; datatype: string } => {
  const rulesData = getRulesData(false, "all", true, "");
  const secWithoutBrackets = replaceAll(replaceAll(sec, "(", ""), ")", "");
  const valWithoutBrackets = replaceAll(replaceAll(value, "(", ""), ")", "");

  const section = rulesData.filter((r) => r.title === secWithoutBrackets);

  let val = valWithoutBrackets;
  if (value.includes(".")) {
    const v = value.split(".");
    val = v[v.length - 1];
  }

  if (val.includes("_")) {
    const v = val.split("_");
    val = v[v.length - 1];
  }

  if (section.length > 0) {
    const items = section[0].items.filter((i) => i.title === val);

    const subItemTitles: string[] = [];
    section[0].items.forEach((i) => i.items.map((si) => si.title).forEach((t) => subItemTitles.push(t)));

    if (subItemTitles.includes(val)) {
      const filteredSection = section[0].items.filter((i) => i.items.map((si) => si.title).includes(val));
      if (filteredSection.length > 0) {
        const filteredSubSection = filteredSection[0].items.filter((si) => si.title === val);
        if (filteredSubSection.length > 0) {
          return {
            sample: filteredSubSection[0].sample,
            datatype: filteredSubSection[0].dataType,
          };
        }
      }
    } else if (items.length > 0) {
      return { sample: items[0].sample, datatype: items[0].dataType };
    }
  } else {
    const filtered = supportedFunctions.filter((f) => sec.includes(f.value));
    if (filtered.length > 0) {
      return { sample: filtered[0].sample, datatype: filtered[0].dataType };
    }
  }

  return { sample: "", datatype: DATA_TYPES.string };
};

const FunctionsPopup: React.FC<Props> = (props) => {
  const { show, isDemoMode, isSuperAdmin, organisation, handleSubmit, handleClose } = props;
  const [visibleDropDown, setVisibleDropDown] = useState("");
  const [feature1, setFeature1] = useState("");
  const [feature2, setFeature2] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [functionData, setFunctionData] = useState<FunctionChild>();
  const [rulesData] = useState(
    getRulesData(isDemoMode, CHECK_POINTS.Customer, isSuperAdmin, organisation).filter((r) => r.title !== FUNCTIONS)
  );
  const [featureValue, setFeatureValue] = useState("");

  const getDropdownData = (_data: ItemModel[]) => {
    const data: DataProps[] = [];
    _data.forEach((r) => {
      data.push({
        title: r.title,
        items: r.items.length > 0 ? getDropdownData(r.items) : [],
        datatype: r.dataType,
      });
    });

    return data;
  };

  return (
    <Modal show={show} onHide={handleClose} animation size={selectedFunction.length > 0 ? "lg" : undefined} centered>
      <Modal.Header style={{ alignSelf: "center", display: "flex", alignItems: "center" }}>
        <Title style={{ fontSize: 16, marginRight: 10 }}>Select function type: </Title>
        <RecursiveDropdown
          show={visibleDropDown === DROPDOWN_TYPE.Functions}
          onDropdownClicked={(shown) => {
            setVisibleDropDown(shown ? "" : DROPDOWN_TYPE.Functions);
          }}
          onItemClicked={(val) => {
            setSelectedFunction(val);
            setFeature1("");
            setFeature2("");
            setVisibleDropDown("");

            const functionsChild = supportedFunctions.filter((f) => f.title === val);
            if (functionsChild.length > 0) {
              setFunctionData(functionsChild[0]);
            }
          }}
          value={selectedFunction}
          data={supportedFunctions.map((f) => ({ title: f.title, datatype: f.dataType, items: [] }))}
        />
      </Modal.Header>
      <Modal.Body>
        {selectedFunction.length > 0 ? (
          <>
            <StyledUl style={{ justifyContent: "left", marginLeft: 20 }}>
              <div style={{ marginRight: 10 }}>
                {MULTI_FEATURE_FUNCTIONS.includes(selectedFunction) ? DROPDOWN_TYPE.Feature1 : "Select Feature"}
              </div>
              <RecursiveDropdown
                show={visibleDropDown === DROPDOWN_TYPE.Feature1}
                onDropdownClicked={(shown) => {
                  setVisibleDropDown(shown ? "" : DROPDOWN_TYPE.Feature1);
                }}
                onItemClicked={(val) => {
                  setFeature1(val);
                  setVisibleDropDown("");
                }}
                value={feature1}
                data={getDropdownData(rulesData)}
              />
              {functionData && !functionData?.hasOperator && !MULTI_FEATURE_FUNCTIONS.includes(selectedFunction) ? (
                <FormControl
                  placeholder="Value"
                  aria-describedby="basic-addon2"
                  style={{ marginLeft: 10, maxWidth: 200 }}
                  onChange={(event) => {
                    setFeatureValue(event.target.value);
                  }}
                />
              ) : null}
            </StyledUl>
            {MULTI_FEATURE_FUNCTIONS.includes(selectedFunction) ? (
              <StyledUl style={{ justifyContent: "left", marginLeft: 20 }}>
                <div style={{ marginRight: 10 }}>
                  {MULTI_FEATURE_FUNCTIONS.includes(selectedFunction) ? DROPDOWN_TYPE.Feature2 : "Select Feature"}
                </div>
                <RecursiveDropdown
                  show={visibleDropDown === DROPDOWN_TYPE.Feature2}
                  onDropdownClicked={(shown) => {
                    setVisibleDropDown(shown ? "" : DROPDOWN_TYPE.Feature2);
                  }}
                  onItemClicked={(val) => {
                    setFeature2(val);
                    setVisibleDropDown("");
                  }}
                  value={feature2}
                  data={getDropdownData(rulesData)}
                />
              </StyledUl>
            ) : null}

            <br />
            <StyledUl style={{ justifyContent: "flex-end" }}>
              <Button style={{ backgroundColor: "lightgrey", marginRight: 10, border: "none" }} onClick={handleClose}>
                Dismiss
              </Button>
              <Button
                style={{ width: 80 }}
                disabled={
                  MULTI_FEATURE_FUNCTIONS.includes(selectedFunction)
                    ? feature1.length === 0 || feature2.length === 0
                    : feature1.length === 0
                }
                onClick={() => {
                  if (functionData) {
                    let dt = DATA_TYPES.string as string;
                    const arr = feature1.split(".");
                    if (arr.length > 0) {
                      const sec = arr[0];
                      dt = getSampleValue(sec, feature1.replace(`${sec}.`, "")).datatype;
                    }

                    const val = `${functionData.value}(${
                      MULTI_FEATURE_FUNCTIONS.includes(selectedFunction)
                        ? `${feature1},${feature2}`
                        : functionData.hasOperator
                        ? `${feature1}`
                        : `${feature1}, ${dt === DATA_TYPES.string ? `"${featureValue}"` : `${featureValue}`}`
                    })`;

                    handleSubmit({
                      data: functionData,
                      value: val,
                    });
                    setSelectedFunction("");
                    setFunctionData(undefined);
                    setFeature1("");
                    setFeature2("");
                  }
                }}
              >
                Submit
              </Button>
            </StyledUl>
          </>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default FunctionsPopup;
