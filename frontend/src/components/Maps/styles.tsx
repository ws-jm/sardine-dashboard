import styled from "styled-components";
import { Popup } from "react-leaflet";

export const StlyedPopup = styled(Popup)`
  .leaflet-popup-content {
    overflow: auto;
  }
`;

export const MapWrapper = styled.div`
  height: 400px;
  width: inherit;
  position: sticky;
`;
