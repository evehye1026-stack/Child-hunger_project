export type StoreType = "restaurant" | "convenience";

export type Store = {
  id: string;
  type: StoreType;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  hours: string;
  closed?: boolean;
};

export type Category =
  | "삼각김밥"
  | "김밥"
  | "샌드위치"
  | "도시락"
  | "밥류(컵밥/덮밥/볶음밥)"
  | "만두"
  | "면류"
  | "빵(식사대용)"
  | "국/탕(즉석국)"
  | "계란"
  | "우유/두유"
  | "닭가슴살"
  | "두부"
  | "치즈"
  | "그릭요거트";

export type MajorCategory =
  | "밥류"
  | "분식·면류"
  | "빵·샌드위치"
  | "단백질간식"
  | "국물요리"
  | "유제품·음료";

export type NutrientLevel = 1 | 2 | 3;

export type Product = {
  id: string;
  storeType: "convenience";
  category: Category;
  name: string;
  manufacturer: string;
  emoji: string;
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
};

export type ComboItem = {
  id: string;
  name: string;
  emoji: string;
};
