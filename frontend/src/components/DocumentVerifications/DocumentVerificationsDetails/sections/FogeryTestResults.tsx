import { ForgeryTestResults } from "sardine-dashboard-typescript-definitions";
import { CardBody } from "styles/Card";
import { Card } from "react-bootstrap";
import { StyledTable, StyledTh, StyledTr, Cell } from "components/Table/styles";
import classNames from "classnames";

interface FogeryTestSectionProps {
  results?: ForgeryTestResults[];
}

const headers = ["Type", "Sub Type", "value"];

export const FogeryTestResultsSection = ({ results = [] }: FogeryTestSectionProps) => {
  const hasResult = results.length > 0;
  if (!hasResult) return null;

  return (
    <Card className="mt-5">
      <Card.Header className="font-weight-bold" style={{ color: "var(--dark-14)" }}>
        Forgery Test Results
      </Card.Header>
      <CardBody className="d-flex" isGrid>
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
          {results.map((r) => {
            const isForged = r.result === "FORGED";
            const isUnknown = r.result === "UNKNOWN";

            return (
              <tbody>
                <StyledTr>
                  <Cell
                    className={classNames({
                      "font-weight-bold": isForged,
                    })}
                  >
                    {r.type}
                  </Cell>
                  <Cell
                    className={classNames({
                      "font-weight-bold": isForged,
                    })}
                  >
                    {r.subtype}
                  </Cell>
                  <Cell
                    className={classNames({
                      "font-weight-bold": isForged || isUnknown,
                      "text-danger": isForged,
                    })}
                  >
                    {r.result}
                  </Cell>
                </StyledTr>
              </tbody>
            );
          })}
        </StyledTable>
      </CardBody>
    </Card>
  );
};
