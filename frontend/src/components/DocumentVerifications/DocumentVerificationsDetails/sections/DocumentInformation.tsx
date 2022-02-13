import { DocumentData } from "sardine-dashboard-typescript-definitions";
import { Card } from "react-bootstrap";
import { CardText, CardTitle, CardGridItem, CardBody } from "styles/Card";

import { startCase } from "lodash-es";

export const documentInformationSectionFields: (keyof DocumentData)[] = [
  "type",
  "number",
  "date_of_birth",
  "date_of_issue",
  "date_of_expiry",
  "issuing_country",
  "first_name",
  "middle_name",
  "last_name",
  "gender",
  "address",
];

export const documentInformationFieldFormatters: Partial<Record<keyof DocumentData, (str: string) => string>> = {
  type: (str) => startCase(str),
};

interface DocumentInformationSectionProps {
  documentData?: Partial<DocumentData>;
}

export const DocumentInformationSection = ({ documentData = {} }: DocumentInformationSectionProps) => (
  <Card className="mt-5">
    <Card.Header className="font-weight-bold" style={{ color: "var(--dark-14)" }}>
      Document information
    </Card.Header>
    <CardBody isGrid>
      {documentInformationSectionFields.map((field) => {
        const formatter = documentInformationFieldFormatters[field];
        const value = formatter ? formatter(documentData[field] || "") : documentData[field];

        if (!value) return null;

        return (
          <CardGridItem>
            <CardTitle>{startCase(field)}</CardTitle>
            <CardText>{value}</CardText>
          </CardGridItem>
        );
      })}
    </CardBody>
  </Card>
);
