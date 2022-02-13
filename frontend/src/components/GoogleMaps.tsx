import { useEffect, useRef, useState, FC } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { captureException } from "utils/errorUtils";
import { useLatLngFetchResult } from "hooks/fetchHooks";

// Dev credentials: https://console.cloud.google.com/google/maps-apis/credentials?project=indigo-computer-272415
// Prod credentials: https://console.cloud.google.com/google/maps-apis/credentials?project=prod-sardine-ai
const apiKey =
  import.meta.env.VITE_APP_SARDINE_ENV === "production"
    ? "AIzaSyCg69h32j1fJiuWeTR8FIdsm2OBrswE2SM"
    : "AIzaSyCSOvuswio4Le7mPMOXYpWN7zoSp0dwoCM";

export const GoogleMapsWrapper = ({ children }: { children: JSX.Element }): JSX.Element => {
  const render = (status: Status) => <h3>{status}</h3>;

  return (
    <Wrapper apiKey={apiKey} render={render}>
      {children}
    </Wrapper>
  );
};

export interface LatLng {
  lat: number;
  lng: number;
}

// When it is used, caller should be in @googlemaps/react-Wrapper. If not, it might fail because it might not have loaded the JS.
export const fetchLatLng = async (address: string): Promise<LatLng> => {
  if (window.google === undefined || window.google.maps === undefined) {
    throw new Error("Google Maps API is not loaded");
  }
  const geocoder = new window.google.maps.Geocoder();
  const res = await geocoder.geocode({ address }).catch(captureException);
  if (res === undefined) {
    return { lat: 0, lng: 0 };
  }
  const { results } = res;
  if (results.length === 0) {
    return { lat: 0, lng: 0 };
  }
  const result = results[0];
  return { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };
};

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string | number };
  streetViewFunc?: (el: HTMLDivElement) => google.maps.StreetViewPanorama;
}

// https://developers.google.com/maps/documentation/javascript/react-map
export const GoogleMap: FC<MapProps> = ({ style, streetViewFunc }): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && map === undefined) {
      setMap(
        new window.google.maps.Map(ref.current, {
          streetView: streetViewFunc === undefined ? undefined : streetViewFunc(ref.current),
        })
      );
    }
  }, [ref, map]);

  return <div ref={ref} style={style} />;
};

interface StreetMapProps extends google.maps.MapOptions {
  address: string;
  style: { [key: string]: string | number };
  panoramaOptions: google.maps.StreetViewPanoramaOptions;
}

export const GoogleStreetViewMap: FC<StreetMapProps> = ({ address, style, panoramaOptions }): JSX.Element => {
  const fetchLatLngResult = useLatLngFetchResult({ address, enabled: true });
  if (fetchLatLngResult.data === undefined) {
    return <div />;
  }

  const streetViewFunc = (el: HTMLDivElement) =>
    new window.google.maps.StreetViewPanorama(el, { ...panoramaOptions, position: fetchLatLngResult.data });
  return <GoogleMap streetViewFunc={streetViewFunc} style={style} />;
};
