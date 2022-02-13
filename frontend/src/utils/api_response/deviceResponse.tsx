import { DeviceProfile } from "sardine-dashboard-typescript-definitions";

export interface DeviceProfileResponse {
  profile?: DeviceProfile;
  hits: {
    hits: Array<DeviceProfileHit>;
  };
}

export interface DeviceProfileHit {
  _source: DeviceProfile;
}
