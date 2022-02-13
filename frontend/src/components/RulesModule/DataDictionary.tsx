import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { StyledTable, StyledTr, BackgroundBox, Title, StyledTh, StyledUl } from "./styles";
import { getRulesData, ItemModel, rulesForDataDictionary } from "../../utils/dataProviderUtils";

const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 8px 8px;
  border: 1px solid lightgrey;
`;

const TableRow = styled(StyledTr)`
  color: black;
`;

const DataDictionary: React.FC = () => {
  const location = useLocation();

  const headers = ["PARAMETER", "DATA TYPE", "SAMPLE VALUE", "DESCRIPTION"];
  const isDemoMode = location.search.toLowerCase().includes("demo");
  const rules = rulesForDataDictionary(getRulesData(isDemoMode, "all", false), "", isDemoMode);

  return (
    <BackgroundBox style={{ marginLeft: 10, marginRight: 10, width: "100%", boxShadow: "none" }}>
      <StyledUl style={{ justifyContent: "space-between", width: "100%" }}>
        <Title style={{ fontSize: 18, margin: 30, marginLeft: 10, width: "100%" }}>{"Rules Editor > Data Dictionary"}</Title>
      </StyledUl>
      <div style={{ height: 1, backgroundColor: "grey", marginBottom: 5 }} />
      <StyledTable style={{ width: "99%" }}>
        <thead>
          <StyledTr style={{ height: 45, backgroundColor: "#325078" }}>
            {headers.map((ele, eleIndex) => (
              <StyledTh style={{ textAlign: [1, 2].includes(eleIndex) ? "center" : "left", color: "white" }} key={ele}>
                {ele}
              </StyledTh>
            ))}
          </StyledTr>
        </thead>
        <tbody>
          {rules.map((data: ItemModel) => (
            <>
              <div style={{ marginTop: 5 }} />
              <TableRow key={data.title} style={{ maxHeight: 150 }}>
                <Cell>{data.title}</Cell>
                <Cell style={{ textAlign: "center" }}>{data.dataType}</Cell>
                <Cell style={{ textAlign: "center" }}>{data.sample}</Cell>
                <Cell>{data.description}</Cell>
              </TableRow>
            </>
          ))}
        </tbody>
      </StyledTable>
    </BackgroundBox>
  );
};

export default DataDictionary;
