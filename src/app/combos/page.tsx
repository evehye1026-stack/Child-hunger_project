import ComboListScreen from "@/components/ComboListScreen";
import { getConvenienceProducts } from "@/lib/products";

export default function CombosPage() {
  const products = getConvenienceProducts();
  return <ComboListScreen products={products} />;
}
