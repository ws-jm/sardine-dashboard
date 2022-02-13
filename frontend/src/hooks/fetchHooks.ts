import { useQuery } from "react-query";
import { getClientIdObject, getRules, fetchOrganisationNames, fetchDeviceProfile } from "utils/api";
import { ClientIdObject, Rule, OrgName, DATA_SOURCE } from "sardine-dashboard-typescript-definitions";
import { CACHE_KEYS } from "../constants";
import { QueryResult } from "../interfaces/queryInterfaces";
import { fetchLatLng, LatLng } from "../components/GoogleMaps";
import { DeviceProfileResponse } from "../utils/api_response/deviceResponse";

export const useDeviceProfileFetchResult = ({
  clientId,
  orgName,
  sessionKey,
  enabled,
}: {
  clientId: string;
  orgName: string;
  sessionKey: string;
  enabled: boolean;
}): QueryResult<DeviceProfileResponse> => {
  const { data, error, status } = useQuery<{ result: DeviceProfileResponse }, Error>(
    [CACHE_KEYS.DEVICE_PROFILE, orgName, sessionKey],
    () => fetchDeviceProfile({ organisation: orgName, sessionKey, source: DATA_SOURCE.DATASTORE, clientId }),
    { enabled }
  );
  return {
    status,
    data: data === undefined ? undefined : data.result,
    error,
  };
};

export const useRulesFetchResult = ({
  clientId,
  checkpoint,
  enabled,
  orgName,
}: {
  clientId: string;
  checkpoint: string;
  enabled: boolean;
  orgName: string;
}): QueryResult<Rule[]> => {
  const { data, error, status } = useQuery<Rule[], Error>(
    [CACHE_KEYS.RULES, orgName, checkpoint],
    () => getRules(clientId, checkpoint),
    { enabled }
  );

  return {
    status,
    data,
    error,
  };
};

export const useClientIdFetchResult = ({
  organisation,
  enabled,
}: {
  organisation: string;
  enabled: boolean;
}): QueryResult<string> => {
  const { data, error, status } = useQuery<ClientIdObject, Error>(
    [CACHE_KEYS.CLIENT_ID, organisation],
    () => getClientIdObject(organisation),
    {
      enabled,
    }
  );
  return {
    status,
    error,
    data: data ? data.client_id : undefined,
  };
};

export const useOrganizationNamesResult = ({ enabled }: { enabled: boolean }): QueryResult<OrgName[]> => {
  const { data, error, status } = useQuery<OrgName[], Error>([CACHE_KEYS.ORGANIZATION_NAMES], () => fetchOrganisationNames(), {
    enabled,
  });

  return {
    status,
    data,
    error,
  };
};

// When it is used, caller should be in @googlemaps/react-Wrapper. If not, it might fail because it might not have loaded the JS.
export const useLatLngFetchResult = ({ enabled, address }: { enabled: boolean; address: string }): QueryResult<LatLng> => {
  const { data, error, status } = useQuery<LatLng, Error>([CACHE_KEYS.LAT_LNG, address], () => fetchLatLng(address), { enabled });
  return { status, data, error };
};
