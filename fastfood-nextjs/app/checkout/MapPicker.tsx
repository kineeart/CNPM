"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createDefaultIcon = () =>
  new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const MapPicker = ({
  lat,
  lon,
  setLat,
  setLon,
}: {
  lat: number | null;
  lon: number | null;
  setLat: (value: number) => void;
  setLon: (value: number) => void;
}) => {
  const defaultPosition: [number, number] = [lat || 10.7769, lon || 106.7009];
  const icon = createDefaultIcon();

  const AutoZoom = () => {
    const map = useMap();
    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 16);
      }
    }, [lat, lon, map]);
    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(event) {
        setLat(event.latlng.lat);
        setLon(event.latlng.lng);
      },
    });
    return null;
  };

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={lat && lon ? [lat, lon] : defaultPosition} icon={icon} />
      <MapClickHandler />
      <AutoZoom />
    </MapContainer>
  );
};

export default MapPicker;
