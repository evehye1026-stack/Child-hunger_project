import LogMealScreen from "@/components/LogMealScreen";
import { getConvenienceProducts } from "@/lib/products";

export default function LogPage() {
  const products = getConvenienceProducts();
  return <LogMealScreen products={products} />;
}
