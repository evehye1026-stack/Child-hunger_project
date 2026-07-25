"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/useMyLocation";
import type { Store } from "@/lib/types";

function storeIcon(type: Store["type"]) {
  const borderColor = type === "restaurant" ? "#16A34A" : "#2563EB";
  const emoji = type === "restaurant" ? "🍽️" : "🏪";
  return L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid ${borderColor};box-shadow:0 2px 6px rgba(0,0,0,0.3);">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -38],
  });
}

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#111827;border:3px solid white;box-shadow:0 0 0 6px rgba(17,24,39,0.2);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 실제 위치를 나중에 받아오면(내 위치 버튼) 지도가 그쪽으로 다시 움직이게 한다 —
// react-leaflet은 center prop을 최초 렌더에만 적용하고 이후 변경엔 반응하지 않는다.
function RecenterMap({ lat, lng }: LatLng) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

type Props = {
  stores: Store[];
  myLocation: LatLng;
};

export default function MapView({ stores, myLocation }: Props) {
  return (
    <MapContainer
      center={[myLocation.lat, myLocation.lng]}
      zoom={14}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={myLocation.lat} lng={myLocation.lng} />
      <Marker position={[myLocation.lat, myLocation.lng]} icon={meIcon} />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.lat, store.lng]}
          icon={storeIcon(store.type)}
        >
          <Popup>
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold">{store.name}</span>
              <Link href={`/store/${store.id}`} className="font-bold text-c-blue">
                자세히 보기 →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
