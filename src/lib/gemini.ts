type ReplyMood = "default" | "curious" | "worried" | "excited";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
const REQUEST_TIMEOUT_MS = 6000;

const MOOD_TONE: Record<ReplyMood, string> = {
  default: "차분하고 친근한 말투",
  curious: "궁금해하며 되묻는 말투",
  worried: "살짝 걱정하면서도 다정한 말투",
  excited: "신나고 칭찬하는 말투",
};

function buildPrompt(draft: string, mood: ReplyMood): string {
  return `너는 "든든이"라는 친근한 급식 도우미 마스코트 챗봇이야. 초등학생 정도의 아이들에게 편의점 음식의 영양 정보를 알려줘.

아래 "초안"은 딱딱한 템플릿 문장이야. 이 문장에 담긴 사실(음식 이름, 수치, 추천 상품, 질문 내용)은 빠짐없이 유지하되, 표현과 어순은 자유롭게 바꿔서 ${MOOD_TONE[mood]}의 자연스러운 대화체 반말/친근한 존댓말로 완전히 다시 써줘.
반드시 초안과 다른 문장으로 새로 써야 해 — 초안을 그대로 복사하거나 토씨 하나만 바꾸는 건 안 돼. 그렇다고 새로운 사실을 지어내지도 마.
1~2문장 이내로 짧게, 답변 문장만 출력해. 따옴표나 다른 설명은 붙이지 마.

초안: ${draft}`;
}

// 규칙 기반으로 이미 확정된 사실 문장(음식 매칭·영양 평가 결과)의 말투만 Gemini로
// 자연스럽게 다듬는다. API 키가 없거나 호출이 실패/타임아웃되면 원래 문장을 그대로
// 돌려줘서, 챗봇의 사실 판단 로직 자체는 항상 결정론적으로 동작한다.
export async function naturalizeReply(draft: string, mood: ReplyMood): Promise<string> {
  if (!GEMINI_API_KEY) return draft;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(draft, mood) }] }],
          // 최신 모델은 답변 전에 내부적으로 "thinking" 토큰을 먼저 소모한다 — maxOutputTokens가
          // 너무 낮으면 thinking에 다 쓰고 정작 답변이 중간에 잘려 나오므로 넉넉히 잡는다.
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!res.ok) return draft;

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || draft;
  } catch {
    return draft;
  } finally {
    clearTimeout(timeoutId);
  }
}
