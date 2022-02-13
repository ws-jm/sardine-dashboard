import { FC } from "react";
import { Card } from "react-bootstrap";

export const TableCardWrapper: FC<{
  children: JSX.Element;
  cardKey: string;
  cardBodyStyle: React.CSSProperties;
  headerLabel: string;
}> = ({ children, cardKey, cardBodyStyle, headerLabel }): JSX.Element => (
  <Card style={{ marginTop: 30 }} key={cardKey}>
    <Card.Header style={{ color: "var(--dark-14)" }}>{headerLabel}</Card.Header>
    <Card.Body style={cardBodyStyle}>{children}</Card.Body>
  </Card>
);
