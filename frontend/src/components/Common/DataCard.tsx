import React, { ReactNode } from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { replaceAllSpacesWithUnderscores, replaceAllUnderscoresWithSpaces } from "utils/stringUtils";
import { DetailsCardView, DetailsCardTitle, DetailsCardValue } from "../Queues/styles";

export interface CardAttribute {
  key: string;
  value: ReactNode;
  valueParser?: (val: ReactNode) => string;
  toolTip?: string;
}

interface Props {
  header: string;
  attributes: Array<CardAttribute>;
  children?: JSX.Element;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

interface CardTitleProps {
  title: string;
  tooltip: string;
}

interface CardAttributesProps {
  attribute: CardAttribute;
  keyId: number;
}

const defaultValueParser = (value: ReactNode) => (value === "" || value === undefined || value === null ? "-" : value);

const DetailCardTitle: React.FC<CardTitleProps> = (props) => {
  const { title, tooltip } = props;
  if (tooltip === "") {
    return (
      <DetailsCardTitle>
        <div id={`${replaceAllSpacesWithUnderscores(title)}_title`} data-tid="title">
          {title}
        </div>
      </DetailsCardTitle>
    );
  }
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id={title}>{tooltip}</Tooltip>}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontWeight: 500,
            paddingRight: 10,
          }}
        >
          <DetailsCardTitle>
            <div>{title}</div>
          </DetailsCardTitle>
        </div>
      </div>
    </OverlayTrigger>
  );
};

const CardAttributes: React.FC<CardAttributesProps> = (props) => {
  const { attribute, keyId } = props;
  const { key, value, toolTip = "", valueParser = defaultValueParser } = attribute;
  return (
    <div
      style={{
        margin: "20px 5px",
        alignItems: "center",
        lineBreak: "anywhere",
      }}
      key={keyId}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <DetailCardTitle title={replaceAllUnderscoresWithSpaces(key)} tooltip={toolTip} />
      </div>
      <DetailsCardValue>
        <div id={`${replaceAllSpacesWithUnderscores(key)}_value`}>{valueParser(value)}</div>
      </DetailsCardValue>
    </div>
  );
};

const DataCard: React.FC<Props> = (props) => {
  const { header, attributes, children, bodyStyle, headerStyle } = props;
  return (
    <DetailsCardView>
      <Card.Header
        id={replaceAllSpacesWithUnderscores(header)}
        style={{
          fontSize: 20,
          color: "#B9C5E0",
          backgroundColor: "transparent",
          border: "none",
          paddingTop: 10,
          fontWeight: "normal",
          ...headerStyle,
        }}
      >
        {header}
      </Card.Header>

      <Card.Body
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 250px)",
          gridAutoRows: "auto",
          ...bodyStyle,
        }}
      >
        {attributes.map((attr, keyId) => (
          <CardAttributes attribute={attr} keyId={keyId} key={attr.key} />
        ))}
        {children}
      </Card.Body>
    </DetailsCardView>
  );
};

export default DataCard;
