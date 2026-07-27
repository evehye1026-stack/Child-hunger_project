import { evaluateCarb, evaluateProtein, evaluateSodium } from "./ageNutrition";
import { getConvenienceProducts } from "./products";
import { getIngredientEmoji, getProductsByMajorCategory } from "./productHelpers";
import { nutritionScore } from "./nutrition";
import { getRawSodiumPeers, searchRawFoods, type RawFood } from "./rawFoodDb";
import type { MajorCategory, Product } from "./types";

const PLACEHOLDER_EMOJI = "🍽️";
const SODIUM_HIGH_PERCENTILE = 0.7;
const CARB_BALANCED_MIN = 50;
const CARB_BALANCED_MAX = 65;
const MAX_ALTERNATIVES = 5;
const MAX_SUGGESTIONS = 3;

export type MatchedFood = {
  source: "curated" | "raw";
  id: string;
  name: string;
  category: string;
  emoji: string;
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
};

export type MatchResult =
  | { matched: true; food: MatchedFood; alternatives: MatchedFood[] }
  | { matched: false; suggestions: MatchedFood[] };

export type MiniCard = {
  name: string;
  emoji: string;
  energyKcal: number;
  proteinG: number;
  sodiumMg: number;
};

// 마스코트(든든이) 표정 — 챗봇 응답의 성격에 따라 결정한다.
// worried: 방금 확인한 음식이 단백질 부족/나트륨 과다였을 때 (플로팅 버튼도 이 표정으로 바뀜)
// excited: 좋은 조합이었을 때, curious: 나이를 묻거나 매칭에 실패했을 때, default: 그 외
export type Mood = "default" | "curious" | "worried" | "excited";

export type DietLogSuggestion = {
  primary: MatchedFood;
  recommended: MatchedFood;
  feedbackMessage: string;
};

export type ChatReply = {
  matched: boolean;
  reply: string;
  card: MiniCard | null;
  recommendationCard: MiniCard | null;
  alternatives: MatchedFood[];
  mood: Mood;
  dietLogSuggestion: DietLogSuggestion | null;
};

function fromProduct(p: Product): MatchedFood {
  return {
    source: "curated",
    id: p.id,
    name: p.name,
    category: p.category,
    emoji: p.emoji,
    energyKcal: p.energyKcal,
    carbG: p.carbG,
    proteinG: p.proteinG,
    fatG: p.fatG,
    sodiumMg: p.sodiumMg,
  };
}

function fromRawFood(r: RawFood): MatchedFood {
  return {
    source: "raw",
    id: r.id,
    name: r.name,
    category: r.midCategory ?? "기타",
    emoji: getIngredientEmoji(r.name, PLACEHOLDER_EMOJI),
    energyKcal: r.energyKcal,
    carbG: r.carbG,
    proteinG: r.proteinG,
    fatG: r.fatG,
    sodiumMg: r.sodiumMg,
  };
}

function toMiniCard(food: MatchedFood): MiniCard {
  return {
    name: food.name,
    emoji: food.emoji,
    energyKcal: food.energyKcal,
    proteinG: food.proteinG,
    sodiumMg: food.sodiumMg,
  };
}

// "참치김밥 먹으려고" / "라면 먹을 건데 뭐 먹지" / "치즈스틱 어때?" / "제육 먹고 싶어" 같은
// 흔한 말투에서 뒤에 붙는 어미를 잘라내고 음식 이름만 남긴다.
const TRAILING_FILLER = new RegExp(
  "(먹고\\s*싶|먹고파|먹으려고|먹을려고|먹을\\s*건데|먹을까요?|먹을래요?|뭐\\s*먹지|뭐\\s*먹을까|살까요?|살\\s*건데|좋을까요?|괜찮을까요?|어때요?|줄까요?)[\\s\\S]*$"
);

// 상품명 비교 시 띄어쓰기 차이("치즈 스틱" vs "치즈스틱")로 매칭이 실패하지 않도록
// 공백을 모두 제거하고 비교한다.
function normalizeForMatch(name: string): string {
  return name.replace(/\s+/g, "");
}

export function extractFoodQuery(message: string): string {
  const stripped = message.trim().replace(TRAILING_FILLER, "").trim();
  const cleaned = stripped.replace(/[?!.,~]+$/g, "").trim();
  return cleaned || message.trim();
}

// 3순위 폴백에서 쓰는, 자유 텍스트 → 기존 6개 대분류(MajorCategory) 키워드 사전
const FOOD_KEYWORD_TO_MAJOR_CATEGORY: Array<{ pattern: RegExp; major: MajorCategory }> = [
  { pattern: /(라면|우동|파스타|스파게티|국수|냉면|만두)/, major: "분식·면류" },
  { pattern: /(김밥|삼각김밥|도시락|덮밥|볶음밥|컵밥|주먹밥)/, major: "밥류" },
  { pattern: /(빵|샌드위치|토스트|베이글)/, major: "빵·샌드위치" },
  { pattern: /(닭가슴살|계란|삶은\s*계란|두부|단백질바)/, major: "단백질간식" },
  { pattern: /(국|탕|찌개|스프)/, major: "국물요리" },
  { pattern: /(우유|두유|치즈|요거트|요구르트)/, major: "유제품·음료" },
];

function guessMajorCategory(message: string): MajorCategory | null {
  for (const rule of FOOD_KEYWORD_TO_MAJOR_CATEGORY) {
    if (rule.pattern.test(message)) return rule.major;
  }
  return null;
}

function findExactOrPartial(products: Product[], query: string): Product[] {
  const normalizedQuery = normalizeForMatch(query);
  const exact = products.filter((p) => normalizeForMatch(p.name) === normalizedQuery);
  if (exact.length > 0) return exact;
  return products.filter((p) => {
    const normalizedName = normalizeForMatch(p.name);
    return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
  });
}

function pickRepresentative<T extends { name: string }>(
  items: T[]
): { primary: T; alternatives: T[] } {
  const sorted = [...items].sort((a, b) => a.name.length - b.name.length);
  const [primary, ...rest] = sorted;
  return { primary, alternatives: rest.slice(0, MAX_ALTERNATIVES) };
}

// 상품명 매칭 3단계: 255개 큐레이션 DB → 원본 298,271건 → (둘 다 없으면) 카테고리 추정 폴백
export function matchFood(message: string): MatchResult {
  const query = extractFoodQuery(message);
  const curated = getConvenienceProducts();

  const curatedHits = query ? findExactOrPartial(curated, query) : [];
  if (curatedHits.length > 0) {
    const { primary, alternatives } = pickRepresentative(curatedHits);
    return { matched: true, food: fromProduct(primary), alternatives: alternatives.map(fromProduct) };
  }

  const rawHits = query ? searchRawFoods(query) : [];
  if (rawHits.length > 0) {
    const { primary, alternatives } = pickRepresentative(rawHits);
    return { matched: true, food: fromRawFood(primary), alternatives: alternatives.map(fromRawFood) };
  }

  const major = guessMajorCategory(message);
  const pool = major ? getProductsByMajorCategory(curated, major) : curated;
  const suggestions = [...pool]
    .sort((a, b) => nutritionScore(b) - nutritionScore(a))
    .slice(0, MAX_SUGGESTIONS)
    .map(fromProduct);

  return { matched: false, suggestions };
}

// 매칭된 음식(255개 큐레이션 또는 원본 전체) 하나를 나이 기준으로 평가하고,
// 챗봇 말투 답변 한 줄로 압축한다. 평가 로직 자체(evaluateProtein/Sodium/Carb)는
// 기존 것을 그대로 호출 — 여기서는 입력 정리와 문장 조합만 한다.
export function buildChatReply(message: string, age: number): ChatReply {
  const result = matchFood(message);

  if (!result.matched) {
    return {
      matched: false,
      reply: "그 음식은 아직 몰라요! 대신 이런 건 어때요?",
      card: null,
      recommendationCard: null,
      alternatives: result.suggestions,
      mood: "curious",
      dietLogSuggestion: null,
    };
  }

  const { food, alternatives } = result;

  // "불고기"/"제육"처럼 특정 상품명이 아니라 재료·키워드로 물어봐서 여러 개가 매칭되면,
  // 대표 1개를 멋대로 골라 평가하지 않고 그 재료가 들어간 음식들을 먼저 보여주고 고르게 한다.
  // (하나로 좁혀지는 경우, 예: "버섯소불고기도시락 먹고 싶다"는 바로 아래 평가로 진행된다.)
  if (alternatives.length > 0) {
    const query = extractFoodQuery(message);
    return {
      matched: true,
      reply: `'${query}'(이)가 들어간 음식이 여러 개 있어요! 어떤 걸로 먹을지 말해줄래요?`,
      card: null,
      recommendationCard: null,
      alternatives: [food, ...alternatives],
      mood: "curious",
      dietLogSuggestion: null,
    };
  }

  const curatedProducts = getConvenienceProducts();

  // evaluateProtein/evaluateCarb는 product.proteinG · .carbG · .energyKcal만 읽으므로
  // MatchedFood(원본 DB 매칭분 포함)를 그대로 넘겨도 안전하다 — Product 전체 타입만 요구할 뿐.
  const protein = evaluateProtein(food as unknown as Product, age, curatedProducts);
  const categoryPeers =
    food.source === "curated"
      ? curatedProducts.filter((p) => p.category === food.category)
      : getRawSodiumPeers(food.category);
  const sodium = evaluateSodium(food, categoryPeers);
  const carb = evaluateCarb(food as unknown as Product);

  let reply: string;
  let mood: Mood;
  let recommendationCard: MiniCard | null = null;
  let dietLogSuggestion: DietLogSuggestion | null = null;

  if (!protein.sufficient && protein.recommendation) {
    const recommended = fromProduct(protein.recommendation);
    const feedbackMessage = `${food.name}은(는) 좋은데 단백질이 조금 부족해요. ${protein.recommendation.name} 같이 드셔보세요`;
    reply = `${feedbackMessage}. 두 음식을 식단일기에 넣을까요?`;
    recommendationCard = toMiniCard(recommended);
    mood = "worried";
    dietLogSuggestion = { primary: food, recommended, feedbackMessage };
  } else if (sodium.percentile >= SODIUM_HIGH_PERCENTILE) {
    reply = `${food.category} 중에서는 좀 짠 편이에요. 물도 챙겨 드세요`;
    mood = "worried";
  } else if (carb.ratioPercent >= CARB_BALANCED_MIN && carb.ratioPercent <= CARB_BALANCED_MAX) {
    reply = carb.message;
    mood = "excited";
  } else {
    reply = "이 조합 좋아요!";
    mood = "excited";
  }

  return {
    matched: true,
    reply,
    card: toMiniCard(food),
    recommendationCard,
    alternatives,
    mood,
    dietLogSuggestion,
  };
}
