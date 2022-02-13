import styled from "styled-components";

export const StyledInput = styled.input`
  width: 100%;
  height: 48px;
  border-radius: 4px;
  background-color: #ffffff;
  margin: 8px 0px;
  padding: 0px 8px;
`;

export const StyledArea = styled.textarea`
  width: 100%;
  height: 100px;
  border-radius: 4px;
  background-color: #ffffff;
  margin: 8px 0px;
  padding: 8px 8px;
`;

export const SubmitButton = styled.button`
  width: 400px;
  height: 48px;
  border-radius: 4px;
  background: #2173ff;
  max-width: 100%;
  border-radius: 4px;
  border: none;
  display: flex;
  margin: 50px 0px;
  cursor: pointer;
  color: #ffffff;
  align-self: center;
  span {
    margin: auto;
    text-align: center;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
  }
`;

export const ErrorText = styled.div`
  font-size: 12px;
  text-align: left;
  color: red;
`;

export const MainDiv = styled.div`
  // position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 0%;
  // height: 1100px;

  margin: auto;
  width: 500px;
  //   height : 495px;
`;

export const BackgroundBox = styled.div`
  // position: absolute;
  left: 0%;
  right: 0%;
  top: 5%;
  bottom: 5%;
  // height: 1100px;

  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.05);
  @media (max-width: 760px) {
    border-radius: 10px 10px 0px 0px;
  }
`;

export const Title = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
`;

export const TextNormal = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-size: 15px;
  line-height: 18px;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
`;

export const HorizontalContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const HorizontalSpace = styled.div`
  margin: 15px;
`;

export const TitleWithLogo = styled.div`
  width: 87px;
  height: 48px;
  margin: 24px 0px 0px 24px;
  display: flex;
`;

export const Container = styled.div``;

export const DashedLine = styled.div`
  margin: 15px 0px 15px 0px;
  height: 1px;
  border-style: dashed;
  border-width: 0.5px;
  width: 100%;
  border-color: grey;
`;

export const Line = styled.div`
  margin: 15px 0px 15px 0px;
  border: 1px solid #eaedf2;
  width: 100%;
`;

export const StyledHeading = styled.div`
  max-width: 100%;
  height: 24px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 26px;
  color: var(--dark-14);
  margin: 30px 24px 0 24px;
`;

export const StyledSubHeading = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 140%;
  font-feature-settings: "ss02" on;
  color: var(--dark-14);
  margin: 15px 0px 15px 0px;
`;

export const StyledContainer = styled.div`
  margin: 50px 50px 0px;
  @media (max-width: 760px) {
    margin: 32px 16px 0px;
  }
  label {
    margin-bottom: 0px;
  }
`;

export const StyledUl = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledLi = styled.li`
  float: left;
`;

export const Dropbtn = styled.div`
  text-align: center;
  padding: 14px 16px;
  background: rgb(240, 240, 240);
  width: 270px;
  height: 50px;
  max-width: 100%;
  border-radius: 4px;
  border: none;
  display: flex;
  margin: 8px 0px;
  cursor: pointer;
  color: #001932;
  span {
    margin: auto;
    text-align: center;
    font-family: IBM Plex Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
  }
`;

export const SubDropbtn = styled.div`
  text-align: center;
  padding: 14px 16px;
  width: 250px;
  height: 40;
  max-width: 100%;
  display: flex;
  cursor: pointer;
  color: black;
  justify-content: space-between;
  span {
    font-weight: 600;
    font-size: 20px;
  }
`;

export const DropDownContent = styled.div`
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  width: 250px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

export const SubDropDownContent = styled.div`
  display: none;
  position: absolute;
  left: 250px;
  background-color: #fff;
  width: 280px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

export const DropDownLi = styled(StyledLi)`
  display: inline-block;
  &:hover {
    background-color: transparent;
  }
`;

export const SubA = styled.a`
  color: #325078;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  &:hover {
    background-color: #f1f1f1;
  }
`;

export const RadioButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  background: #fafafa;
  border: 1px solid #ddd;
  display: flex;
  margin: 8px 0px;
`;

export const RadioButtonSelected = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  background: #2173ff;
  border: 2px solid #ddd;
  display: flex;
  margin: 8px 0px;
`;

export const ChipWrapper = styled.div`
  justify-content: flex-start;
`;

export const ChipContainer = styled.div`
  font-family: IBM Plex Sans;
  background-color: rgb(240, 240, 240);
  font-size: normal;
  border-radius: 30px;
  height: 30px;
  padding: 0 4px 0 1rem;
  display: inline-flex;
  align-items: center;
  margin: 0 0.3rem 0.3rem 0;
`;

export const ChipCancelButton = styled.div`
  background-color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font: inherit;
  margin-left: 10px;
  font-weight: bold;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  display: table;
`;

export const StyledTh = styled.th`
  height: 16px;
  padding: 0px 8px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  /* identical to box height */

  letter-spacing: 0.14em;
  text-transform: uppercase;

  /* Secondary */

  color: black;
`;

export const StyledTr = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  color: grey;
  padding: 9px 0px;
  background-color: #ffffff;
  :hover {
    color: #ffffff;
    background-color: #325078;
    > td {
      color: #ffffff !important;
    }
  }
`;

export const StyledTd = styled.td`
  vertical-align: middle;
  height: 25px;
  padding: 0px 8px;
`;

export const SortBtn = styled.div`
  font-family: IBM Plex Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: center;
  margin-right: 20px;
  text-decoration: underline;
`;

export const CSVParent = styled.div`
  margin-left: 15px;
  height: 40px;
  > div {
    padding: 10px 20px !important;
  }
  > div > div {
    background: transparent !important;
    width: 150px !important;
    height: 100% !important;
    line-break: anywhere !important;
  }
  > div > div > div {
    height: 90% !important;
  }
  > div > div > div > span:first-child {
    display: none;
    height: 0px;
  }
  > div > div > div > span:last-child {
    white-space: nowrap;
    text-overflow: clip;
    overflow: hidden;
    display: inherit;
    width: 170px;
    font-size: 14px;
    text-align: center;
  }
`;

export const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 250px);
  grid-auto-rows: auto;
  gap: 20px;
`;

export const RuleOutputContainer = styled.div`
  background-color: #f8fbff;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const RuleOutputTitle = styled(Title)`
  margin: 5px 20px;
  line-break: auto;
  white-space: pre-wrap;
  line-height: 1.6px;
  display: flex;
  align-items: center;
`;

export const DataDictionaryContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  min-width: 140px;
  height: 40px;
  border-radius: 6px;
`;
