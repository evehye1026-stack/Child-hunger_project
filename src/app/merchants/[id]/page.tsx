import { notFound } from "next/navigation";
import BareBackButton from "@/components/BareBackButton";
import { getMerchantById } from "@/lib/merchants";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MerchantDetailPage({ params }: Props) {
  const { id } = await params;
  const result = getMerchantById(id);

  if (!result) {
    notFound();
  }

  const { merchant, type } = result;
  const isRestaurant = type === "restaurant";

  return (
    <div className="flex min-h-dvh flex-col bg-cream sm:min-h-full">
      <header className="flex items-center gap-3 p-4">
        <BareBackButton />
        <h1 className="truncate text-xl font-bold text-gray-800">{merchant.name}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center text-3xl">
              {isRestaurant ? "🍽️" : "🏪"}
            </span>
            <div>
              <p className="text-xl font-bold text-gray-800">{merchant.name}</p>
              {merchant.signName && merchant.signName !== merchant.name && (
                <p className="text-base text-gray-400">{merchant.signName}</p>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-600">{merchant.address}</p>
          {merchant.phone && (
            <p className="mt-1 text-lg text-gray-600">{merchant.phone}</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-base font-bold text-gray-500">
            {isRestaurant ? "일반음식점" : "편의점"}
            {merchant.district ? ` · ${merchant.district}` : ""}
          </p>
        </section>
      </main>
    </div>
  );
}
