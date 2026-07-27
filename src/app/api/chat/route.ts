import type { NextRequest } from "next/server";
import { buildChatReply } from "@/lib/chatbot";

type ChatRequestBody = {
  message?: unknown;
  age?: unknown;
};

// POST /api/chat  { message: string; age: number | null }
// 나이가 없으면 needsAge:true만 돌려주고 평가는 하지 않는다 — 나이는 프론트(useChildAge,
// localStorage)가 들고 있다가 답을 받으면 이 엔드포인트를 같은 message로 다시 호출한다.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequestBody;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const age = typeof body.age === "number" && Number.isFinite(body.age) ? body.age : null;

  if (!message) {
    return Response.json({ error: "메시지가 비어 있어요" }, { status: 400 });
  }

  if (age === null) {
    return Response.json({ needsAge: true });
  }

  const reply = await buildChatReply(message, age);
  return Response.json({ needsAge: false, ...reply });
}
