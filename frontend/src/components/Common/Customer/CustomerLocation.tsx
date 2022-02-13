import React from "react";
import { GOOGLE_STREET_VIEW_MAP_STYLE, GOOGLE_STREET_VIEW_PANORAMA_OPTIONS } from "../../../constants";
import { GoogleMapsWrapper, GoogleStreetViewMap } from "../../GoogleMaps";
import DataCard, { CardAttribute } from "../DataCard";
import { Link } from "../Links";

const HEADER = "Location";

interface CustomerDetailsProps {
  address: string;
  city: string;
  postalCode: string;
  regionCode: string;
  countryCode: string;
  mapUrl: string;
}

const CustomerLocation: React.FC<CustomerDetailsProps> = (props) => {
  const { address, city, countryCode, postalCode, regionCode, mapUrl } = props;

  const attributes: CardAttribute[] = [
    {
      key: "Address",
      value: (
        <>
          {mapUrl === "" ? (
            <span>{address}</span>
          ) : (
            <Link id="address_link" href={mapUrl} rel="noreferrer" target="_blank">
              {address}
            </Link>
          )}
          {address === "" ? null : (
            <GoogleMapsWrapper>
              <GoogleStreetViewMap
                address={address}
                style={GOOGLE_STREET_VIEW_MAP_STYLE}
                panoramaOptions={GOOGLE_STREET_VIEW_PANORAMA_OPTIONS}
              />
            </GoogleMapsWrapper>
          )}
        </>
      ),
      toolTip: "Customer's address, provided by you",
    },
    {
      key: "City",
      value: city,
      toolTip: "Customer's city, provided by you",
    },
    {
      key: "Postal Code",
      value: postalCode,
      toolTip: "Customer's postal code, provided by you",
    },
    {
      key: "Region Code",
      value: regionCode,
      toolTip: "Customer's region code, provided by you",
    },
    {
      key: "Country Code",
      value: countryCode,
      toolTip: "Customer's country code, provided by you",
    },
  ];
  return <DataCard header={HEADER} attributes={attributes} />;
};

export default CustomerLocation;
