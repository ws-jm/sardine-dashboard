import { FilterData } from "components/Common/FilterField";

export const CLIENT_QUERY_FIELD = "client";
export const CLIENT_ID_QUERY_FIELD = "client_id";

// extend it if needed
export function constructFiltersQueryParams(
  dataFilters: Array<FilterData>,
  organisation: string | null
): { searchString: string; params: { [key: string]: string } } {
  const params: { [key: string]: string } = {};

  dataFilters.forEach((filter) => {
    if (filter.apply) params[filter.key] = filter.value;
  });

  if (organisation) params[CLIENT_QUERY_FIELD] = organisation;

  return {
    searchString: new URLSearchParams(params).toString(),
    // use for extending
    params,
  };
}
