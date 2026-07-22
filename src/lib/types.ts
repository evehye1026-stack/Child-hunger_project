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

export type Category = "riceball" | "lunchbox" | "sandwich" | "drink" | "snack";

export type NutrientLevel = 1 | 2 | 3;

export type Product = {
  id: string;
  storeType: "convenience";
  category: Category;
  name: string;
  emoji: string;
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
  veggieLevel: NutrientLevel;
};

export type ComboItem = {
  id: string;
  name: string;
  emoji: string;
};
