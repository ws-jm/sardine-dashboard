import React, { useState } from "react";
import { Image } from "react-bootstrap";
import { DROP_DOWN_BG, isDurationValue } from "../../utils/dataProviderUtils";
import rightArrow from "../../utils/logo/rightArrow.png";
import rightArrowWhite from "../../utils/logo/rightArrowWhite.png";
import {
  Title,
  StyledUl,
  DropDownLi,
  Dropbtn,
  SubA,
  SubDropDownContent,
  SubDropbtn,
  DropDownContent,
} from "../RulesModule/styles";

export interface DataProps {
  title: string;
  items: DataProps[];
  datatype: string;
}

interface ArrowProps {
  isSelected: boolean;
}

interface RecursiveDropdownProps {
  show: boolean;
  value: string;
  data: DataProps[];
  onDropdownClicked: (show: boolean) => void;
  onItemClicked: (value: string, datatype: string) => void;
  style?: React.CSSProperties;
}

const RecursiveDropdown = (p: RecursiveDropdownProps) => {
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubSections, setSelectedSubSections] = useState<string[]>([]);

  const IconArrow = (iProps: ArrowProps) => (
    <Image
      className="dropdown"
      src={iProps.isSelected ? rightArrowWhite : rightArrow}
      style={{ width: 10, height: 10, alignSelf: "center" }}
    />
  );

  const handleItemClick = (value: string, dt: string, parentTitle: string) => {
    if (!value) return;

    if (selectedSection.length > 0) {
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

      p.onItemClicked(val, dt);
    } else {
      p.onItemClicked(value, dt);
    }

    setSelectedSubSections([]);
    setSelectedSection("");
  };

  const renderDropDownItem = (items: DataProps[], parentTitle: string): JSX.Element | JSX.Element[] =>
    items.map((item) =>
      item.items.length === 0 ? (
        <SubA
          key={item.title}
          onClick={() => handleItemClick(item.title, item.datatype, `${parentTitle}_${item.title}`)}
          className="dropdown"
        >
          {item.title}
        </SubA>
      ) : (
        <div className="dropdown" key={item.title}>
          <SubDropbtn
            key={item.title}
            onClick={() => {
              const section = p.data.filter((r: DataProps) => r.title === selectedSection);
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
              style={{
                height: 20,
                color: selectedSubSections.includes(item.title) ? "#FFFFFF" : "#325078",
              }}
              className="dropdown"
            >
              {item.title}
            </Title>
            {item.items.length > 0 ? <IconArrow isSelected={selectedSubSections.includes(item.title)} /> : null}
          </SubDropbtn>
          {selectedSubSections.includes(item.title) ? (
            <SubDropDownContent style={{ top: 0, left: 280, display: "block" }} className="dropdown">
              {renderDropDownItem(item.items, `${parentTitle}_${item.title}`)}
            </SubDropDownContent>
          ) : null}
        </div>
      )
    );

  const renderDropDown = () => {
    const result = p.data.map((element, ind) => (
      <DropDownLi key={element.title}>
        <SubDropbtn
          onClick={() => {
            if (p.data[ind].items.length > 0) {
              const val = element.title === selectedSection ? "" : element.title;
              setSelectedSection(val);
            } else {
              handleItemClick(element.title, element.datatype, element.title);
            }
          }}
          style={{
            backgroundColor: selectedSection === element.title ? "#2173FF" : "",
          }}
          className="dropdown"
        >
          <Title
            style={{
              color: selectedSection === element.title ? "#FFFFFF" : "#325078",
            }}
            className="dropdown"
          >
            {element.title}
          </Title>
          {element.items.length > 0 ? <IconArrow isSelected={selectedSection === element.title} /> : null}
        </SubDropbtn>
        {selectedSection === element.title ? (
          <SubDropDownContent style={{ top: 0, display: "block" }} className="dropdown">
            {" "}
            {renderDropDownItem(element.items, element.title)}
          </SubDropDownContent>
        ) : null}
      </DropDownLi>
    ));

    return <ul style={{ padding: 0 }}> {result} </ul>;
  };

  return (
    <StyledUl style={{ justifyContent: "left", backgroundColor: "transparent", minWidth: "max-content", ...p.style }}>
      <DropDownLi>
        <Dropbtn
          style={{
            height: 40,
            alignItems: "center",
            backgroundColor: DROP_DOWN_BG,
            textTransform: "capitalize",
            width: "100%",
          }}
          onClick={() => p.onDropdownClicked(p.show)}
        >
          {p.value.length > 0 ? p.value : "Select Field"}
        </Dropbtn>
        <DropDownContent
          style={{
            display: p.show ? "block" : "",
          }}
        >
          {renderDropDown()}
        </DropDownContent>
      </DropDownLi>
    </StyledUl>
  );
};

export default RecursiveDropdown;
