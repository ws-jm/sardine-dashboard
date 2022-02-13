import { DEFAULT_ORGANISATION_FOR_SUPERUSER } from "config";
import { CLIENT_QUERY_FIELD } from "./constructFiltersQueryParams";

export function getClientFromQueryParams(pathSearch: string, isSuperAdmin: boolean, organisationFromUserStore: string): string {
  const searchParams = new URLSearchParams(pathSearch);
  const orgFromParams = searchParams.get(CLIENT_QUERY_FIELD);
  if (orgFromParams) return orgFromParams;
  if (!isSuperAdmin) return organisationFromUserStore;
  if (organisationFromUserStore === "all") return DEFAULT_ORGANISATION_FOR_SUPERUSER;
  // isSuperAdmin && organisationFromUserStore is something not "all"
  return organisationFromUserStore;
}
