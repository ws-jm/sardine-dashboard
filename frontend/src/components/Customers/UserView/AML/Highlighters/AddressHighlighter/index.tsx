import { ReactElement } from "react";
import { Highlighter } from "components/Highlighter";
import { AmlPostalAddress } from "sardine-dashboard-typescript-definitions";
import { ListItemSepByComa } from "styles/List";
import { extractStreetWords } from "utils/customerSessionUtils";
import { HighlighterProps } from "../types";
import { mapStateByCode } from "./mapStateByCode";

export const AddressHighlighter = ({ value, customerData }: HighlighterProps<AmlPostalAddress>): JSX.Element => {
  const { address_fields_list } = customerData;
  let regionCode = "";
  let postalCode = "";
  let cityName = "";
  let countryCode = "";
  if (address_fields_list.length > 0) {
    const { region_code, postal_code, city, country_code } = address_fields_list[0];
    regionCode = region_code;
    postalCode = postal_code;
    cityName = city;
    countryCode = country_code;
  }

  const stateFromRegionCode = mapStateByCode[regionCode];

  const {
    line1,
    type,
    state: stateFromValue,
    postal_code: postal_code_from_value,
    city: city_from_value,
    country_code: country_code_from_value,
  } = value;

  const renderItems: (ReactElement | string)[] = [];

  if (type) {
    renderItems.push(<ListItemSepByComa key={type}>{type}</ListItemSepByComa>);
  }

  if (line1) {
    const streetWords = extractStreetWords(customerData);

    renderItems.push(
      <ListItemSepByComa key={`line1_${line1}`}>
        <Highlighter searchWords={streetWords} textToHighlight={line1} />
      </ListItemSepByComa>
    );
  }

  if (stateFromRegionCode) {
    renderItems.push(
      <ListItemSepByComa key={`stateFromRegionCode_${stateFromRegionCode}`}>
        <Highlighter searchWords={[stateFromRegionCode]} textToHighlight={stateFromValue} />
      </ListItemSepByComa>
    );
  }

  if (postal_code_from_value) {
    renderItems.push(
      <ListItemSepByComa key={`postal_code_from_value_${postal_code_from_value}`}>
        <Highlighter searchWords={[postalCode]} textToHighlight={postal_code_from_value} />
      </ListItemSepByComa>
    );
  }

  if (city_from_value) {
    renderItems.push(
      <ListItemSepByComa key={`city_from_value_${city_from_value}`}>
        <Highlighter searchWords={[cityName]} textToHighlight={city_from_value} />
      </ListItemSepByComa>
    );
  }

  if (country_code_from_value) {
    renderItems.push(
      <ListItemSepByComa key={`country_code_from_value_${country_code_from_value}`}>
        <Highlighter searchWords={[countryCode]} textToHighlight={country_code_from_value} />
      </ListItemSepByComa>
    );
  }

  return <>{renderItems}</>;
};
