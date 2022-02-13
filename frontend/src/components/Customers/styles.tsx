import styled from "styled-components";
import { Card } from "react-bootstrap";
import { StyledTitleName } from "components/Dashboard/styles";

const TableWrapper = styled.div`
  margin: 30px 0;
  width: inherit;
`;

const StyledMainDiv = styled.div`
  @media (min-width: 1400px) {
    width: 95%;
    padding-left: 2%;
    padding-right: 5%;
  }
  @media only screen and (max-width: 1400px) and (min-width: 1300px) {
    width: 90%;
    padding-left: 5%;
    padding-right: 5%;
  }
  @media only screen and (max-width: 1300px) and (min-width: 700px) {
    margin: 20px 10px;
    width: 80%;
  }
`;

const InputGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  .search-btn {
    width: 300px;
    cursor: pointer;
  }
  @media (max-width: 480px) {
    display: block;
  }
`;

const UserProfilePic = styled.div`
  height: 36px;
  width: 36px;
  border-radius: 18px;
  margin: 15px 12px 16px 16px;
  border: #325078;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
`;

const StyledTableCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledCard = styled(Card)`
  background-color: transparent;
  border: none;
  & > .card-header {
    border: none;
    padding: 20px;
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: 20px;
    font-weight: 600;
  }
  & > .card-body {
    position: relative;
    background-color: white;
    display: flex;
    flex-wrap: wrap;
    & > div {
      width: 100%;
      padding: 16px;
      border-bottom: 1px solid #f2f6ff;
    }
  }
  @media (min-width: 1600px) {
    & > .card-body > div.grid-view {
      width: 25%;
    }
  }
  @media only screen and (max-width: 1600px) and (min-width: 1200px) {
    & > .card-body > div.grid-view {
      width: 33.333333333%;
    }
  }
  @media only screen and (max-width: 1200px) and (min-width: 800px) {
    & > .card-body > div.grid-view {
      width: 50%;
    }
  }
`;

const StyledRulesWrapper = styled.div`
  max-height: 700px;
  overflow-y: auto;
  padding: 0;
  &::-webkit-scrollbar {
    width: 2px;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }
  &::-webkit-scrollbar-thumb {
    background-color: #141a39;
    border-radius: 2px;
    outline: 1px solid slategrey;
  }
`;

const BorderHide = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background-color: white;
`;

const StyleCircularBadge = styled.div`
  position: relative;
  & > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    & #session_level {
      text-transform: capitalize;
      font-size: 20px;
      color: #f7b904;
      text-align: center;
    }
    & #session_level_label {
      font-size: 12px;
      color: #141a39;
    }
  }
`;

const StyledCardBody = styled(Card.Body)`
  display: flex;
  gap: 20px;
  & #biometrics_steps {
    width: 40%;
    & .MuiStepLabel-root.MuiStepLabel-alternativeLabel {
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
    & .MuiStepLabel-label.MuiStepLabel-alternativeLabel {
      margin-top: 0;
    }
    & .MuiStepConnector-alternativeLabel {
      position: unset;
    }
    & .MuiStep-alternativeLabel {
      flex: 0;
    }
    & .MuiStepConnector-vertical {
      padding: 0;
      margin-left: 8px;
    }
    & .MuiStepConnector-lineVertical {
      min-height: 50px;
    }
  }
`;

const UserCard = styled(Card)`
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background-color: rgb(255, 255, 255);
`;

const ScoreWrapper = styled.div`
  .btn-secondary {
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
  }
`;

const PinContainer = styled.div`
  margin: 0,
  padding: 0,
  width: '80vw',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 250px)',
  gridAutoRows: '10px',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  justifyContent: 'center',
  backgroundColor: 'black'
`;

const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 10px 10px;
`;

export const BaseStyledTr = styled.tr`
  height: 36px;

  border-radius: 4px;
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 140%;
  font-feature-settings: "ss02" on, "zero" on;
  padding: 9px 0px;
  background-color: #ffffff;
  :nth-child(even) {
    background-color: #f7f9fc;
  }
`;

const StyledTr = styled(BaseStyledTr)<{ isHighlight?: boolean }>`
  ${(props) => {
    if (!props.isHighlight) {
      return `
        color: #000000;
        :hover {
          color: #ffffff;
        }
      `;
    }

    return `
      color: #14a2b8;
      font-weight: bold;
      :hover {
        color: #ccf8ff
      }
    `;
  }}
  :hover {
    a,
    .btn-link {
      color: white;
    }
    color: #ffffff;
    background-color: #325078;
  }
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  display: table;
`;

const StyledTh = styled.th`
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

const DetailsHeaderParent = styled.div`
  display: flex;
  align-items: center;
  grid-template-columns: repeat(auto-fill, 250px);
  grid-auto-rows: auto;
`;

const DetailsHeaderChild = styled.div`
  margin: 10px 10px;
`;

const DetailsHeaderValue = styled.span`
  font-family: IBM Plex Sans;
  letter-spacing: 0em;
  text-align: left;
  line-break: anywhere;
  font-size: 14px;
  color: var(--dark-14);
`;

const DetailsHeaderTile = styled(StyledTitleName)`
  font-size: 14px;
  color: rgb(144, 155, 173);
  font-weight: normal;
  display: inline;
  margin-right: 18px;
`;

export {
  TableWrapper,
  InputGroupWrapper,
  StyledMainDiv,
  UserProfilePic,
  StyledRulesWrapper,
  StyleCircularBadge,
  StyledCard,
  StyledCardBody,
  StyledTableCell,
  BorderHide,
  UserCard,
  ScoreWrapper,
  PinContainer,
  Cell,
  StyledTable,
  StyledTh,
  StyledTr,
  DetailsHeaderParent,
  DetailsHeaderChild,
  DetailsHeaderValue,
  DetailsHeaderTile,
};
