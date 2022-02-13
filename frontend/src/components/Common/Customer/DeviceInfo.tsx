import { KEY_DEVICE_AND_BEHAVIOUR_DETAILS } from "components/Customers/UserView";
import DataCard, { CardAttribute } from "../DataCard";
import { Link } from "../Links";

interface DeviceInfoProps {
  deviceId?: string;
  browser?: string;
  os?: string;
  trueOs?: string;
  deviceIp?: string;
  ipCity?: string;
  ipRegion?: string;
  ipCountry?: string;
  remoteDesktop?: boolean;
  emulator?: boolean;
  proxy?: string;
  ipType?: string;
  vpn?: string;
  location:
    | {
        lat: number;
        lon: number;
      }
    | undefined;
}

const DeviceInfo = (props: DeviceInfoProps): JSX.Element => {
  const {
    browser,
    deviceId,
    deviceIp,
    emulator,
    ipCity,
    ipCountry,
    ipRegion,
    ipType,
    os,
    proxy,
    remoteDesktop,
    trueOs,
    vpn,
    location,
  } = props;

  const attributes: CardAttribute[] = [];

  if (deviceId) {
    attributes.push({
      key: "Device Id",
      value: deviceId,
      toolTip: "Id tagged to the customer's device",
    });
  }

  if (browser) {
    attributes.push({
      key: "Browser",
      value: browser,
      toolTip: "Browser on which session is running on",
    });
  }

  if (os) {
    attributes.push({
      key: "OS",
      value: os,
      toolTip: "OS on which app is running on",
    });
  }

  if (trueOs) {
    attributes.push({
      key: "True OS",
      value: trueOs,
      toolTip: "Actual OS running on device",
    });
  }

  if (deviceIp) {
    attributes.push({
      key: "Device IP",
      value: deviceIp,
      toolTip: "IP Address device accessed from",
    });
  }

  if (ipCity) {
    attributes.push({
      key: "IP City",
      value: ipCity,
      toolTip: "IP Location City",
    });
  }

  if (ipRegion) {
    attributes.push({
      key: "IP Region",
      value: ipRegion,
      toolTip: "IP Location Region",
    });
  }

  if (ipCountry) {
    attributes.push({
      key: "IP Country",
      value: ipCountry,
      toolTip: "IP Location Country",
    });
  }

  if (remoteDesktop !== undefined) {
    attributes.push({
      key: "Remote Desktop",
      value: `${remoteDesktop}`,
      toolTip: "Is customer device controlled via Remote Software?",
    });
  }

  if (emulator !== undefined) {
    attributes.push({
      key: "Emulator",
      value: `${emulator}`,
      toolTip: "Is app running on emulator?",
    });
  }

  if (proxy) {
    attributes.push({
      key: "Proxy",
      value: proxy,
      toolTip: "Likelihood of network being a Proxy",
    });
  }

  if (ipType) {
    attributes.push({
      key: "IP Type",
      value: ipType,
      toolTip: "IP Address Type. Ex: ISP, Mobile, Data Center",
    });
  }

  if (vpn) {
    attributes.push({
      key: "VPN",
      value: vpn,
      toolTip: "Likelihood of network connection being VPN",
    });
  }

  if (location) {
    attributes.push({
      key: "Device Location",
      value: (
        <Link
          target="_blank"
          href={`https://maps.google.com?q=${location.lat},${location.lon}`}
        >{`${location.lat},${location.lon}`}</Link>
      ),
      toolTip: "Location of the device (Longitude, Latitude)",
    });
  }

  return attributes.length > 0 ? <DataCard header={KEY_DEVICE_AND_BEHAVIOUR_DETAILS} attributes={attributes} /> : <div />;
};

export default DeviceInfo;
