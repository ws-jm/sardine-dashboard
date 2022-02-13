import { useMemo } from "react";
import { StyledTable, StyledTh } from "components/Table/styles";
import { AmlKind, CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { TableRow } from "./TableRow";
import { Entity } from "../types";
import { Tbody } from "../styles";

const headers = ["Entity name", "Match score", "Alias names", "Addreses", "Birth Dates", "Signals", "Actions"];
const convertedSignalKey = ["Sanction List", "PEP (Politically Exposed Person)", "Adverse Media"];

interface AmlTableProps {
  amlData: AmlKind;
  customerData: CustomersResponse;
  onEntityView: (entity: Entity) => void;
}

export const Table = ({ amlData, onEntityView, customerData }: AmlTableProps) => {
  const results = useMemo(
    () =>
      amlData.entities
        ?.map<Entity>((e) => ({
          aliases: e.alias.map((a) => a.name),
          dobs: e.birthdates || [],
          addresses: e.postal_addresses,
          matchScore: e.match_score,
          riskScore: e.risk_score,
          entityName: e.entity_name,
          signals: e.signals.map((signal) => ({
            name: convertedSignalKey[signal.key - 1],
            level: signal.value,
          })),
          originalEntity: e,
        }))
        .sort((a, b) => {
          if (a.riskScore !== b.riskScore) {
            return b.riskScore - a.riskScore;
          }
          return b.matchScore - a.matchScore;
        }) || [],
    [amlData]
  );

  return (
    <StyledTable className="w-100">
      <thead>
        <tr
          style={{
            height: "36px",
            backgroundColor: "#f5f5f5",
          }}
        >
          {headers.map((ele, eleIndex) => (
            <StyledTh
              style={{
                textAlign: "left",
                width: eleIndex === 0 ? "20%" : "auto",
              }}
              key={ele}
            >
              {ele}
            </StyledTh>
          ))}
        </tr>
      </thead>
      <Tbody>
        {results.map((entity) => (
          <TableRow
            customerData={customerData}
            key={`${entity.entityName}_${entity.aliases.join("-")}_${entity.addresses.map((a) =>
              Object.values(a).join("-")
            )}_${entity.dobs.join("-")}_${entity.signals.map((s) => `${s.name}-${s.level}`).join("-")}_${
              entity.riskScore
            }_${Object.values(entity.originalEntity).join("-")}`}
            onEntityView={onEntityView}
            entity={entity}
          />
        ))}
      </Tbody>
    </StyledTable>
  );
};
