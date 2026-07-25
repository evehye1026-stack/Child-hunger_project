import Link from "next/link";
import MerchantView from "@/components/MerchantView";
import { getMerchantData } from "@/lib/merchants";

export default function MerchantsPage() {
  const { restaurants, convenience } = getMerchantData();

  return (
    <div className="flex min-h-dvh flex-col bg-cream sm:min-h-full">
      <header className="flex items-center gap-3 p-4">
        <Link
          href="/"
          aria-label="홈으로 이동"
          className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl font-bold transition active:scale-95"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">가맹점 데이터</h1>
          <p className="text-sm text-gray-400">
            화곡동 아동급식카드 가맹점 샘플
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <MerchantView restaurants={restaurants} convenience={convenience} />
      </main>
    </div>
  );
}
