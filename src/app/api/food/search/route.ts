import type { NextRequest } from "next/server";
import { matchFood } from "@/lib/chatbot";

// GET /api/food/search?q=상품명
// 255개 큐레이션 DB를 먼저 찾고, 없으면 원본 298,271건에서 찾는다.
// source: "curated" | "raw" | "none" 으로 어느 쪽에서 왔는지 응답에 표시한다.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return Response.json({ query: q, source: "none", matches: [], suggestions: [] });
  }

  const result = matchFood(q);

  if (!result.matched) {
    return Response.json({
      query: q,
      source: "none",
      matches: [],
      suggestions: result.suggestions,
    });
  }

  return Response.json({
    query: q,
    source: result.food.source,
    matches: [result.food],
    alternatives: result.alternatives,
  });
}
