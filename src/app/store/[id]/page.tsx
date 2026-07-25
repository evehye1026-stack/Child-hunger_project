import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import { getStoreById } from "@/lib/mockData";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const store = getStoreById(id);

  if (!store) {
    notFound();
  }

  const isRestaurant = store.type === "restaurant";

  return (
    <div className="flex min-h-dvh flex-col bg-cream sm:min-h-full">
      <header className="flex items-center gap-3 p-4">
        <BackButton />
        <h1 className="truncate text-xl font-bold text-gray-800">{store.name}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center text-3xl">
              {isRestaurant ? "🍽️" : "🏪"}
            </span>
            <div>
              <p className="text-xl font-bold text-gray-800">{store.name}</p>
              <p className="text-base text-gray-400">{store.hours}</p>
            </div>
          </div>
          <p className="text-lg text-gray-600">{store.address}</p>
          <p className="mt-1 text-lg text-gray-600">{store.phone}</p>
        </section>

        {isRestaurant ? (
          <section className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm">
            <span className="text-5xl">🙂</span>
            <p className="text-lg font-bold text-gray-700">
              여기서도 이용할 수 있어요
            </p>
          </section>
        ) : (
          <Link
            href="/nutrition"
            className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <span className="text-lg font-bold text-gray-700">
                이 편의점 상품 영양 보러가기
              </span>
            </span>
            <span className="text-xl text-gray-300">→</span>
          </Link>
        )}
      </main>
    </div>
  );
}
