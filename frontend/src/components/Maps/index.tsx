import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { LatLngTuple, LatLngExpression } from "leaflet";
import { MapWrapper, StlyedPopup } from "./styles";

const defaultLatLng: LatLngTuple = [39.62, -104.95];
const zoom = 3;

export interface MarkerData {
  position: LatLngExpression;
  details: string;
}

interface Props {
  markers: MarkerData[];
  viewMoreAction(index: number): void;
}

const LeafletMap = (props: Props): JSX.Element => {
  const { markers, viewMoreAction } = props;
  return (
    <MapWrapper>
      <MapContainer
        id="mapId"
        center={defaultLatLng}
        zoom={zoom}
        style={{ height: "100%" }}
        bounds={markers.length > 0 ? markers.map((m) => m.position as LatLngTuple) : undefined}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker, index) => (
          <Marker position={marker.position} key={marker.details}>
            {marker.details.length > 0 ? (
              <StlyedPopup maxHeight={230} maxWidth={300} closeButton={false} zoomAnimation>
                {marker.details.split("\n").map((str) => (
                  <div key={str} style={{ fontSize: 15 }}>
                    {str} <br />
                  </div>
                ))}
                <br />
                <div
                  style={{ color: "#0f81fa", textDecorationLine: "underline" }}
                  onClick={() => {
                    viewMoreAction(index);
                  }}
                  onKeyPress={() => {
                    viewMoreAction(index);
                  }}
                  role="button"
                  tabIndex={index}
                >
                  View More
                </div>
                <br />
              </StlyedPopup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

export default LeafletMap;
