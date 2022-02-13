import { CustomersResponse, SessionKind } from "sardine-dashboard-typescript-definitions";
import {
  constructAddress,
  extractStreetWords,
  generateGoogleMapsUrlFromAddress,
  getLatestAddressFromCustomerResponse,
  getAddressListFromCustomerResponse,
  getLatestMapUrlFromCustomerResponse,
} from "./customerSessionUtils";

test.each([
  [
    "Have street_1, street_2, city, region_code, postal_code, and country_code",
    {
      street_1: "123 Main St",
      street_2: "Apt 1",
      city: "San Francisco",
      region_code: "regionCode",
      postal_code: "postalCode",
      country_code: "US",
    } as SessionKind,
    "123 Main St, Apt 1, San Francisco, regionCode, postalCode, US",
  ],
  [
    "street_2 is empty",
    {
      street_1: "123 Main St",
      street_2: "",
      city: "San Francisco",
      region_code: "regionCode",
      postal_code: "postalCode",
      country_code: "US",
    } as SessionKind,
    "123 Main St, San Francisco, regionCode, postalCode, US",
  ],
  [
    "street_2 is whitespaces",
    {
      street_1: "123 Main St",
      street_2: "  ",
      city: "San Francisco",
      region_code: "regionCode",
      postal_code: "postalCode",
      country_code: "US",
    } as SessionKind,
    "123 Main St, San Francisco, regionCode, postalCode, US",
  ],
])("constructAddress %j", (_testCase, session, expected) => {
  expect(constructAddress(session)).toBe(expected);
});

test.each([
  [
    "Have street1 and street2",
    {
      address_fields_list: [
        {
          street1: "123 Main St",
          street2: "Apt 112",
          city: "",
          region_code: "",
          postal_code: "",
          country_code: "",
        },
        {
          street1: "Hamilton St",
          street2: "Apt 10",
          city: "",
          region_code: "",
          postal_code: "",
          country_code: "",
        },
      ],
    } as CustomersResponse,
    ["123 Main St", "Hamilton St", "Apt 112", "Apt 10"],
  ],
  [
    "street2 is empty",
    {
      address_fields_list: [
        {
          street1: "123 Main St",
          street2: "",
          city: "",
          region_code: "",
          postal_code: "",
          country_code: "",
        },
        {
          street1: "Hamilton St",
          street2: "Apt 10",
          city: "",
          region_code: "",
          postal_code: "",
          country_code: "",
        },
      ],
    } as CustomersResponse,
    ["123 Main St", "Hamilton St", "Apt 10"],
  ],
])("extractStreetWords %s", (_testCase, customerData, expected) => {
  expect(extractStreetWords(customerData)).toEqual(expected);
});

test.each([
  [
    "Normal address",
    "123 Main St, Apt 1, San Francisco, regionCode, postalCode, US",
    "https://www.google.com/maps/search/123%20Main%20St%2C%20Apt%201%2C%20San%20Francisco%2C%20regionCode%2C%20postalCode%2C%20US",
  ],
  ["Empty string address", "", ""],
])("generateGoogleMaprUrlFromAddress %s", (_testCase, addressString, expected) => {
  expect(generateGoogleMapsUrlFromAddress(addressString)).toEqual(expected);
});

test.each([
  [
    "Have 2 addresses",
    {
      address_fields_list: [
        {
          street1: "123 Main St",
          street2: "Apt 1",
          city: "San Francisco",
          region_code: "regionCode",
          postal_code: "94110",
          country_code: "US",
        },
        {
          street1: "Hamilton St",
          street2: "Apt 870",
          city: "West New York",
          region_code: "regionCode",
          postal_code: "12345",
          country_code: "US",
        },
      ],
    } as CustomersResponse,
    ["123 Main St, Apt 1, San Francisco, regionCode, 94110, US", "Hamilton St, Apt 870, West New York, regionCode, 12345, US"],
  ],
  [
    "Have 1 addresses",
    {
      address_fields_list: [
        {
          street1: "Hamilton St",
          street2: "Apt 870",
          city: "West New York",
          region_code: "regionCode",
          postal_code: "12345",
          country_code: "US",
        },
      ],
    } as CustomersResponse,
    ["Hamilton St, Apt 870, West New York, regionCode, 12345, US"],
  ],
  [
    "Have empty address_fields_list",
    {
      address_fields_list: [],
    } as unknown as CustomersResponse,
    [],
  ],
])("getAddressListFromCustomerResponse %s", (_testCase, customerData, expected) => {
  expect(getAddressListFromCustomerResponse(customerData)).toEqual(expected);
});

test.each([
  [
    "Have 2 addresses",
    {
      address_fields_list: [
        {
          street1: "123 Main St",
          street2: "Apt 1",
          city: "San Francisco",
          region_code: "regionCode",
          postal_code: "94110",
          country_code: "US",
        },
        {
          street1: "Hamilton St",
          street2: "Apt 870",
          city: "West New York",
          region_code: "regionCode",
          postal_code: "12345",
          country_code: "US",
        },
      ],
    } as CustomersResponse,
    "123 Main St, Apt 1, San Francisco, regionCode, 94110, US",
  ],
  [
    "Have 1 addresses",
    {
      address_fields_list: [
        {
          street1: "Hamilton St",
          street2: "Apt 870",
          city: "West New York",
          region_code: "regionCode",
          postal_code: "12345",
          country_code: "US",
        },
      ],
    } as CustomersResponse,
    "Hamilton St, Apt 870, West New York, regionCode, 12345, US",
  ],
  [
    "Have empty address_fields_list",
    {
      address_fields_list: [],
    } as unknown as CustomersResponse,
    "",
  ],
])("getLatestAddressFromCustomerResponse %s", (_testCase, customerData, expected) => {
  expect(getLatestAddressFromCustomerResponse(customerData)).toEqual(expected);
});

test.each([
  [
    "Have 1 addresses",
    {
      address_fields_list: [
        {
          street1: "Hamilton St",
          street2: "Apt 870",
          city: "West New York",
          region_code: "regionCode",
          postal_code: "12345",
          country_code: "US",
        },
      ],
    } as CustomersResponse,
    "https://www.google.com/maps/search/Hamilton%20St%2C%20Apt%20870%2C%20West%20New%20York%2C%20regionCode%2C%2012345%2C%20US",
  ],
])("getLatestMapUrlFromCustomerResponse %s", (_testCase, customerData, expected) => {
  expect(getLatestMapUrlFromCustomerResponse(customerData)).toEqual(expected);
});
