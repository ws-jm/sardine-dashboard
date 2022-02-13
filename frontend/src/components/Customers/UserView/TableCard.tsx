import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { replaceAllSpacesWithUnderscores, replaceAllUnderscoresWithSpaces } from "utils/stringUtils";
import BulletView from "components/Common/BulletView";
import { TableCardWrapper } from "./TableCardWrapper";

export const TABLE_CARD_TYPES = {
  COMPONENT: "component",
  LIST: "list",
  CARD: "card",
} as const;

export type TableCardType = typeof TABLE_CARD_TYPES[keyof typeof TABLE_CARD_TYPES];

interface CardElement {
  key: string;
  description: string;
  component: JSX.Element;
}
type CardKeyValue = [string, string] | CardElement;

export const isCardElement = (cardKeyValue: CardKeyValue): cardKeyValue is CardElement =>
  typeof cardKeyValue === "object" && "component" in cardKeyValue;

interface TableCardCustomerData {
  key: string;
  type: typeof TABLE_CARD_TYPES.CARD;
  value: CardKeyValue[];
}

interface TableCardListData {
  key: string;
  type: typeof TABLE_CARD_TYPES.LIST;
  component: JSX.Element;
}

interface TableCardComponentData {
  component: JSX.Element;
  key: string;
  type: typeof TABLE_CARD_TYPES.COMPONENT;
}

export type TableCardData = TableCardCustomerData | TableCardListData | TableCardComponentData;

export const isTableCardCustomerData = (tableCardData: TableCardData): tableCardData is TableCardCustomerData =>
  tableCardData.type === TABLE_CARD_TYPES.CARD;

export const isTableCardListData = (tableCardData: TableCardData): tableCardData is TableCardListData =>
  tableCardData.type === TABLE_CARD_TYPES.LIST;

export const isTableCardComponentData = (tableCardData: TableCardData): tableCardData is TableCardListData =>
  tableCardData.type === TABLE_CARD_TYPES.COMPONENT;

export const CardContentOther: React.FC<{
  cardKeyValue: CardKeyValue;
  ind: number | string;
  getValueForKey: (arg: string) => string | JSX.Element | JSX.Element[];
}> = ({ cardKeyValue, ind, getValueForKey }) => {
  const key: string = Array.isArray(cardKeyValue) ? cardKeyValue[0] : cardKeyValue.key;
  const description: string | undefined = Array.isArray(cardKeyValue) ? cardKeyValue[1] : undefined;
  // checking feature.replaceAll is a temporary fix. feature should be typed correctly.
  // Error detail: https://sentry.io/organizations/sardine/issues/2717710736/?project=5709359&query=is%3Aunresolved
  // String.prototype.replaceAll is a newly added function. Babel should have handle it, but
  // Babel might have failed to transpile it. We should avoid using replaceAll for now.
  const title = (
    <Card.Title
      style={{
        fontSize: 15,
        marginBottom: 3,
        textTransform: "capitalize",
      }}
      className="font-weight-normal"
      id={`${replaceAllSpacesWithUnderscores(key)}_title`}
    >
      {replaceAllUnderscoresWithSpaces(key)}
    </Card.Title>
  );

  const component = isCardElement(cardKeyValue) ? cardKeyValue.component : getValueForKey(key);

  return (
    <div
      style={{
        margin: "20px 5px",
        alignItems: "center",
      }}
      key={ind}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {description ? (
          <OverlayTrigger placement="top" overlay={<Tooltip id={key}>{description}</Tooltip>}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#909BAD",
              }}
            >
              {title}
            </div>
          </OverlayTrigger>
        ) : (
          title
        )}
      </div>
      <div id={`${replaceAllSpacesWithUnderscores(key)}_value`} style={{ fontSize: 14 }}>
        {component}
      </div>
    </div>
  );
};

// TODO: Stop using if/else.
export const TableCard: React.FC<{
  customerData?: CustomersResponse;
  name: string;
  value: CardKeyValue[];
}> = ({ customerData = undefined, name, value }): JSX.Element => {
  const getValueForKey = (key: string) => {
    const filteredData = Object.entries(customerData || {}).filter((d) => d[0] === key);
    if (filteredData.length > 0) {
      if (filteredData[0].length > 1) {
        const val = filteredData[0][1];
        if (!val) {
          return "-";
        }
        return String(val).length > 0 ? <BulletView data={val || ""} /> : "-";
      }
    }
    return "-";
  };

  const content = value.map((featureData, ind) => (
    <CardContentOther
      cardKeyValue={featureData}
      ind={ind}
      getValueForKey={getValueForKey}
      key={isCardElement(featureData) ? featureData.key : featureData.flat().join()}
    />
  ));

  return (
    <TableCardWrapper
      headerLabel={name}
      cardKey={name}
      cardBodyStyle={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, 250px)",
        gridAutoRows: "auto",
      }}
    >
      <>{content}</>
    </TableCardWrapper>
  );
};
