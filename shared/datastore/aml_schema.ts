export interface AmlKind {
  entities: Omit<AmlKind, "entities">[];
  alias: Array<AmlAlias>;
  birthdates: string[];
  postal_addresses: Array<AmlPostalAddress>;
  risk_score: number;
  signals: Array<AmlSignal>;
  version: number;
  entity_name: string;
  client_id: string;
  match_score: number;
  grid_alert_id: string;
  customer_id: string;
  time: number;
  cvip: string;
  session_id: string;
}

export interface AmlSignal {
  key: number;
  name: string;
  value: string;
  sources: Array<AmlSource>;
}

export interface AmlAlias {
  name: string;
  type: string;
}

export interface AmlPostalAddress {
  line1: string;
  city: string;
  type: string;
  country_code: string;
  from_dt: string;
  state: string;
  to_dt: string;
  postal_code: string;
}

export const amlPostalAddressToString = (address: AmlPostalAddress): string =>
  Object.keys(address)
    .map((key) => address[key as keyof AmlPostalAddress])
    .join("_");

export interface AmlSource {
  url: string;
  sub_category: string;
  name: string;
  description: string;
  category: string;
}
