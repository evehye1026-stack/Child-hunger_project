import type { ComboItem, Store } from "./types";

// 강서구 대략 중심점 (내 위치 목업)
export const MY_LOCATION = { lat: 37.5509, lng: 126.8495 };

export const STORES: Store[] = [
  {
    id: "r1",
    type: "restaurant",
    name: "뚜벅이분식",
    lat: 37.5522,
    lng: 126.8503,
    address: "서울 강서구 등촌로 12",
    phone: "02-123-4567",
    hours: "09:00 - 21:00",
  },
  {
    id: "r2",
    type: "restaurant",
    name: "등촌동김밥천국",
    lat: 37.5567,
    lng: 126.8551,
    address: "서울 강서구 등촌로 45",
    phone: "02-234-5678",
    hours: "07:00 - 22:00",
  },
  {
    id: "r3",
    type: "restaurant",
    name: "화곡동맛있는떡볶이",
    lat: 37.5417,
    lng: 126.8402,
    address: "서울 강서구 화곡로 88",
    phone: "02-345-6789",
    hours: "10:00 - 20:00",
    closed: true,
  },
  {
    id: "r4",
    type: "restaurant",
    name: "마곡동설렁탕집",
    lat: 37.5606,
    lng: 126.8265,
    address: "서울 강서구 마곡중앙로 3",
    phone: "02-456-7890",
    hours: "08:00 - 21:00",
  },
  {
    id: "r5",
    type: "restaurant",
    name: "강서네분식",
    lat: 37.5488,
    lng: 126.839,
    address: "서울 강서구 강서로 21",
    phone: "02-567-8901",
    hours: "10:00 - 20:30",
  },
  {
    id: "c1",
    type: "convenience",
    name: "CU 등촌점",
    lat: 37.5545,
    lng: 126.853,
    address: "서울 강서구 등촌로 30",
    phone: "02-678-9012",
    hours: "24시간",
  },
  {
    id: "c2",
    type: "convenience",
    name: "GS25 화곡역점",
    lat: 37.5405,
    lng: 126.841,
    address: "서울 강서구 화곡로 100",
    phone: "02-789-0123",
    hours: "24시간",
  },
  {
    id: "c3",
    type: "convenience",
    name: "세븐일레븐 마곡점",
    lat: 37.5599,
    lng: 126.829,
    address: "서울 강서구 마곡중앙로 15",
    phone: "02-890-1234",
    hours: "24시간",
  },
  {
    id: "c4",
    type: "convenience",
    name: "CU 강서구청점",
    lat: 37.5509,
    lng: 126.8495,
    address: "서울 강서구 화곡로 302",
    phone: "02-901-2345",
    hours: "24시간",
  },
];

// 조합 추천용 보완 상품 (단백질 낮을 때 함께 안내)
export const COMBO_ITEMS: ComboItem[] = [
  { id: "combo-egg", name: "계란", emoji: "🥚" },
  { id: "combo-milk", name: "우유", emoji: "🥛" },
  { id: "combo-soymilk", name: "두유", emoji: "🧃" },
];

export function getStoreById(id: string): Store | undefined {
  return STORES.find((s) => s.id === id);
}
