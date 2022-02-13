import Card from "react-bootstrap/esm/Card";
import styled from "styled-components";

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

const LinkValue = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  line-height: 14px;
  color: #325078;
  text-decoration-line: underline;
`;

const StyledContainer = styled.div`
  margin: 50px 50px 0px;
  @media (max-width: 760px) {
    margin: 32px 16px 0px;
  }
  label {
    margin-bottom: 0px;
  }
`;

const HorizontalContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  @media only screen and (max-width: 700px) {
    display: inherit;
  }
`;

const StyledChildren = styled.div`
  width: 100%;
  @media only screen and (max-width: 700px) {
    transition: left 0.5s ease;
    left: 0px;
    margin-left: none;
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 100vh;
  }
`;

const MethodInfo = styled.div`
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  background-position-y: 100%;
  height: 100%;
`;

const DetailsCardView = styled(Card)`
  background: #ffffff;
  border: 1px solid #eaedf2;
  box-sizing: border-box;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0px 15px 60px rgba(0, 0, 0, 0.05);
  width: 50%;
  height: 300px;
  @media only screen and (max-width: 700px) {
    width: 100%;
  }
`;

const DetailsCardHeader = styled(Card.Header)`
  font-size: 20px;
  color: #b9c5e0;
  background-color: transparent;
  border: none;
  padding-top: 10px;
  font-weight: normal;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: auto;
  width: -webkit-fill-available;
  display: table;
`;

const StyledTh = styled.th`
  height: 16px;
  padding: 10px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 19px;
  /* identical to box height */

  letter-spacing: 0.14em;

  /* Secondary */

  color: #325078;
  background: #f7f9fc;
`;

const StyledTr = styled.tr`
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
  border: solid 2px transparent;
  border-bottom-color: #F7F9FC;
  width: auto;
  :hover {
    background-color: #F7F9FC;
`;

const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 15px 10px;
  letter-spacing: 0em;
  text-align: left;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: #325078;
`;
const TdValue = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 14px;
  color: #001932;
`;

const CardContainer = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 30;
`;

const TitleContainer = styled.div`
  list-style-type: none;
  padding: 15px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  z-index: 20;
  justify-content: space-between;
`;

export {
  TableWrapper,
  InputGroupWrapper,
  StyledMainDiv,
  PinContainer,
  LinkValue,
  DetailsCardView,
  StyledChildren,
  StyledContainer,
  HorizontalContainer,
  MethodInfo,
  StyledTable,
  StyledTh,
  StyledTr,
  Cell,
  TdValue,
  DetailsCardHeader,
  CardContainer,
  TitleContainer,
};
