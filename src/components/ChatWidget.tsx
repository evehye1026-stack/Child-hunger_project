"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useChildAge } from "@/lib/useChildAge";
import type { ChatReply, MatchedFood, Mood, MiniCard } from "@/lib/chatbot";

const MOOD_IMAGES: Record<Mood, string> = {
  default: "/deundeuni-default.png",
  curious: "/deundeuni-curious.png",
  worried: "/deundeuni-worried.png",
  excited: "/deundeuni-excited.png",
};

// 표정별 말풍선 문구 — 상황에 맞는 쪽을 무작위로 하나 골라 띄운다.
const MOOD_CAPTIONS: Record<Mood, [string, string]> = {
  default: ["뭐 먹을지 물어봐요", "궁금한 거 물어봐"],
  curious: ["몇 살인지 알려줄래?", "뭐 먹을지 골랐어요?"],
  worried: ["잠깐, 확인해봐요", "이거 괜찮은지 물어봐요"],
  excited: ["오늘 완벽해요!", "잘 골랐어요!"],
};

function pickCaption(mood: Mood): string {
  const options = MOOD_CAPTIONS[mood];
  return options[Math.floor(Math.random() * options.length)];
}

// 든든이 아이콘이 나오는 곳(헤더/말풍선 아바타/로딩 표시)에 공통으로 쓰는 흰색 원형 배경.
function MascotAvatar({
  mood,
  circleClassName = "h-9 w-9",
  imgClassName = "h-7 w-7",
}: {
  mood: Mood;
  circleClassName?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${circleClassName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MOOD_IMAGES[mood]} alt="" className={`object-contain ${imgClassName}`} />
    </span>
  );
}

// "먹었어" 같은 과거형 표현으로 챗봇이 추천해준 상품을 먹었다고 알려오면 칭찬한다.
const ATE_IT_PATTERN = /먹었|먹음/;
const PRAISE_TEMPLATES = [
  (name: string) => `${name} 먹었구나! 진짜 잘했어요, 오늘 든든하게 채웠어요!`,
  (name: string) => `우와, ${name} 먹었어? 최고예요!`,
];

function pickPraise(name: string): string {
  const templates = PRAISE_TEMPLATES;
  return templates[Math.floor(Math.random() * templates.length)](name);
}

// "먹을게/먹을래/그걸로 할게" 처럼 방금 추천해준 상품을 먹겠다고 답하는 미래형 표현.
// 이 문장을 그대로 matchFood에 넘기면(상품명이 아니라 대화체라) "그 음식은 아직
// 몰라요" 폴백이 떠버리므로, lastRecommendedFood를 참고해 먼저 처리한다.
const WILL_EAT_PATTERN = /먹을게|먹을래|그걸로\s*할게|그거로\s*할게|그렇게\s*할게/;
const AGREEMENT_TEMPLATES = [
  (name: string) => `좋은 선택이에요! ${name} 맛있게 드세요 😋`,
  (name: string) => `${name}(으)로 골랐구나, 좋아요!`,
];

function pickAgreement(name: string): string {
  const templates = AGREEMENT_TEMPLATES;
  return templates[Math.floor(Math.random() * templates.length)](name);
}

// "먹을게/먹었어" 문장이 실제로는 새 음식·재료를 언급한 것일 수 있다("제육 먹을래").
// 그럴 땐 지난 추천을 확인하는 게 아니라 새 음식으로 다시 매칭해야 하므로, 가벼운
// /api/food/search로 이 문장이 실제 상품과 매칭되는지 먼저 확인한다.
async function matchesAnyFood(text: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(text)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.source === "curated" || data.source === "raw";
  } catch {
    return false;
  }
}

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
  mood?: Mood;
  card?: MiniCard;
  recommendationCard?: MiniCard;
  alternatives?: MatchedFood[];
};

const GREETING = "안녕! 나는 든든이야. 지금 뭐 먹으려고?";
const MIN_AGE = 1;
const MAX_AGE = 19;

// 홈/편의점 영양 조회 화면 우측 하단에만 뜨는 플로팅 챗봇 버튼 + 패널.
// 별도 탭/페이지 없이 이 위젯 하나로만 존재한다. 든든이 표정(mood)은 대화 상황에 따라
// 바뀌고, 패널을 닫아도 방금 표정이 플로팅 버튼에 그대로 남아 다시 열어보도록 유도한다.
export default function ChatWidget() {
  const { age, setAge } = useChildAge();
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "bot", text: GREETING, mood: "default" },
  ]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [awaitingAge, setAwaitingAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mood, setMoodState] = useState<Mood>("default");
  // Math.random()으로 고르지 않고 고정값으로 시작 — 서버 렌더와 클라이언트 하이드레이션이
  // 서로 다른 문구를 골라버리면 하이드레이션 불일치가 나서 이 트리가 통째로 다시 그려진다.
  const [caption, setCaption] = useState<string>(MOOD_CAPTIONS.default[0]);
  const [lastRecommendedFood, setLastRecommendedFood] = useState<{ name: string } | null>(null);

  function setMood(next: Mood) {
    setMoodState(next);
    setCaption(pickCaption(next));
  }

  function addMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: nextId() }]);
  }

  async function askBot(message: string, currentAge: number) {
    setLoading(true);
    setMood("curious");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, age: currentAge }),
      });
      if (!res.ok) throw new Error("chat request failed");
      const data: ChatReply & { needsAge: boolean } = await res.json();
      addMessage({
        role: "bot",
        text: data.reply,
        mood: data.mood,
        card: data.card ?? undefined,
        recommendationCard: data.recommendationCard ?? undefined,
        alternatives:
          data.alternatives && data.alternatives.length > 0 ? data.alternatives : undefined,
      });
      setMood(data.mood);
      if (data.recommendationCard) {
        setLastRecommendedFood({ name: data.recommendationCard.name });
      }
    } catch {
      addMessage({ role: "bot", text: "잠깐 문제가 생겼어요. 다시 한 번 말해줄래?", mood: "curious" });
      setMood("curious");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage({ role: "user", text });

    if (awaitingAge) {
      const digits = text.match(/\d+/);
      const parsedAge = digits ? Number(digits[0]) : NaN;
      if (!Number.isFinite(parsedAge) || parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
        addMessage({ role: "bot", text: "숫자로 몇 살인지 말해줄래?", mood: "curious" });
        return;
      }
      setAge(parsedAge);
      setAwaitingAge(false);
      const original = pendingMessage;
      setPendingMessage(null);
      if (original) await askBot(original, parsedAge);
      return;
    }

    if (lastRecommendedFood && (WILL_EAT_PATTERN.test(text) || ATE_IT_PATTERN.test(text))) {
      setLoading(true);
      const mentionsNewFood = await matchesAnyFood(text);
      setLoading(false);

      if (!mentionsNewFood) {
        if (ATE_IT_PATTERN.test(text)) {
          const { name } = lastRecommendedFood;
          setLastRecommendedFood(null);
          addMessage({ role: "bot", text: pickPraise(name), mood: "excited" });
        } else {
          addMessage({ role: "bot", text: pickAgreement(lastRecommendedFood.name), mood: "excited" });
        }
        setMood("excited");
        return;
      }
      // 다른 음식/재료가 실제로 매칭됐다면 지난 추천 얘기가 아니라 새 질문이니 계속 진행
    }

    if (age === null) {
      setPendingMessage(text);
      setAwaitingAge(true);
      addMessage({ role: "bot", text: "몇 살인지 알려줄래?", mood: "curious" });
      setMood("curious");
      return;
    }

    await askBot(text, age);
  }

  function handleOpen() {
    setOpen(true);
    // 방금 걱정/신남 표정으로 열었다는 건 이미 확인했다는 뜻 — 다음 대화를 위해 기본으로.
    if (mood !== "curious") setMood("default");
  }

  if (!open) {
    return (
      <div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-1">
        <div className="rounded-2xl bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm">
          {caption}
        </div>
        <button
          type="button"
          onClick={handleOpen}
          aria-label="든든이 챗봇 열기"
          className="animate-float flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-black/20 transition active:scale-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOOD_IMAGES[mood]} alt="든든이" className="h-12 w-12 object-contain" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] top-16 z-50 flex flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl ring-1 ring-black/10 sm:inset-x-6">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-white p-3">
        <MascotAvatar mood={mood} />
        <span className="flex-1 text-base font-bold text-gray-800">든든이</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-gray-400 transition active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <MascotAvatar mood="curious" circleClassName="h-10 w-10" imgClassName="h-8 w-8" />
            <div className="max-w-[80%] self-start rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
              생각 중...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex shrink-0 gap-2 border-t border-gray-100 bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 참치김밥 먹으려고"
          className="h-12 flex-1 rounded-2xl border border-gray-100 bg-cream px-4 text-base font-bold text-gray-700 outline-none placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 shrink-0 rounded-2xl bg-c-green px-4 text-base font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    // 바깥쪽에서 전체 너비를 확실히 갖고, 안쪽 그룹에만 85% 상한을 걸어야 유저/봇 말풍선의
    // 기준 너비가 똑같아진다 — 봇 쪽에만 아바타 이미지가 형제로 붙어 있으면 그만큼 flex 아이템
    // 너비 계산 기준이 달라져서 "먹었어" 같은 짧은 유저 문장도 이상하게 두 줄로 꺾였었다.
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
        {!isUser && (
          <MascotAvatar
            mood={message.mood ?? "default"}
            circleClassName="h-10 w-10"
            imgClassName="h-8 w-8"
          />
        )}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-bold shadow-sm ${
              isUser ? "bg-c-green text-white" : "bg-white text-gray-800"
            }`}
          >
            {message.text}
          </div>

          {message.card && <NutrientMiniCard card={message.card} />}
          {message.recommendationCard && (
            <NutrientMiniCard card={message.recommendationCard} highlight />
          )}

          {message.alternatives && message.alternatives.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              {message.alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2"
                >
                  <span className="text-xl">
                    <Icon icon={alt.emoji} />
                  </span>
                  <span className="text-xs font-bold text-gray-700">{alt.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NutrientMiniCard({ card, highlight }: { card: MiniCard; highlight?: boolean }) {
  return (
    <div
      className={`flex max-w-[85%] items-center gap-3 rounded-2xl border p-3 ${
        highlight ? "border-c-green bg-c-green/5" : "border-gray-100 bg-white"
      }`}
    >
      <span className="text-2xl">
        <Icon icon={card.emoji} />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">{card.name}</span>
        <span className="text-xs text-gray-400">
          에너지 {card.energyKcal}kcal · 단백질 {card.proteinG}g · 나트륨 {card.sodiumMg}mg
        </span>
      </div>
    </div>
  );
}
