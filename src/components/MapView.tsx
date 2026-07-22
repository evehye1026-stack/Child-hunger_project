"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MY_LOCATION } from "@/lib/mockData";
import type { Store } from "@/lib/types";

function storeIcon(type: Store["type"]) {
  const bg = type === "restaurant" ? "#16A34A" : "#2563EB";
  const emoji = type === "restaurant" ? "🍽️" : "🏪";
  return L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${emoji}</div>`,
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

type Props = {
  stores: Store[];
};

export default function MapView({ stores }: Props) {
  return (
    <MapContainer
      center={[MY_LOCATION.lat, MY_LOCATION.lng]}
      zoom={14}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[MY_LOCATION.lat, MY_LOCATION.lng]} icon={meIcon} />
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
