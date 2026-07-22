import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import NutrientPictogram from "@/components/NutrientPictogram";
import { CATEGORY_LABEL, COMBO_ITEMS, getProductById } from "@/lib/mockData";
import {
  carbLevel,
  fatLevel,
  getComboAdvice,
  getTodaysPickId,
  proteinLevel,
  sodiumLevel,
} from "@/lib/nutrition";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const isTodaysPick = getTodaysPickId(product.category) === product.id;
  const combo = getComboAdvice(product);

  return (
    <div className="flex min-h-dvh flex-col bg-cream sm:min-h-full">
      <header className="flex items-center gap-3 p-4">
        <BackButton />
        <h1 className="truncate text-xl font-bold text-gray-800">
          {product.name}
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-5 p-4">
        <section className="relative flex flex-col items-center gap-2 rounded-2xl bg-white p-8 shadow-sm">
          {isTodaysPick && (
            <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-c-amber text-2xl shadow-sm">
              ⭐
            </span>
          )}
          <span className="text-7xl">{product.emoji}</span>
          <span className="text-base font-bold text-gray-400">
            {CATEGORY_LABEL[product.category]}
          </span>
          <span className="text-sm text-gray-400">{product.energyKcal} kcal</span>
        </section>

        <section className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-4">
          <NutrientPictogram
            label="단백질"
            emoji="💪"
            color="blue"
            level={proteinLevel(product)}
            valueText={`${product.proteinG}g`}
          />
          <NutrientPictogram
            label="탄수화물"
            emoji="🍚"
            color="amber"
            level={carbLevel(product)}
            valueText={`${product.carbG}g`}
          />
          <NutrientPictogram
            label="지방"
            emoji="💧"
            color="coral"
            level={fatLevel(product)}
            valueText={`${product.fatG}g`}
          />
          <NutrientPictogram
            label="나트륨"
            emoji="🧂"
            color="red"
            level={sodiumLevel(product)}
            valueText={`${product.sodiumMg}mg`}
            tilt
          />
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-xl font-bold text-gray-800">{combo.message}</p>
          {combo.showCombo && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                {product.emoji}
              </span>
              {COMBO_ITEMS.map((item, i) => (
                <span key={item.id} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-300">+</span>
                  <span className="flex flex-col items-center gap-1">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-c-green/10 text-3xl">
                      {item.emoji}
                    </span>
                    <span className="text-sm font-bold text-gray-500">
                      {item.name}
                    </span>
                  </span>
                  {i === 0 && (
                    <span className="hidden text-sm text-gray-300 sm:inline">
                      또는
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
