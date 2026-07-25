// PWA/파비콘/애플 홈 화면 아이콘을 든든이 마스코트(public/deundeuni-default.png)로부터 생성한다.
// 재실행 가능 — 필요 시 `node scripts/generate-pwa-icons.mjs`로 다시 만들 수 있다.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = path.join(process.cwd(), "public", "deundeuni-default.png");
const CREAM = { r: 0xfd, g: 0xf8, b: 0xef, alpha: 1 };

async function transparentIcon(size, outPath) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

// 마스코트를 안전영역(정사각형의 약 72%)로 축소해 크림 배경 위에 중앙 합성한다.
// Android가 원형/둥근사각형으로 마스킹해도 캐릭터가 잘리지 않게 하기 위함(maskable icon 규격).
async function maskableIcon(size, outPath) {
  const contentSize = Math.round(size * 0.72);
  const content = await sharp(SOURCE)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const offset = Math.round((size - contentSize) / 2);
  await sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: content, left: offset, top: offset }])
    .png()
    .toFile(outPath);
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`원본 마스코트를 찾을 수 없습니다: ${SOURCE}`);
    process.exit(1);
  }

  const iconsDir = path.join(process.cwd(), "public", "icons");
  fs.mkdirSync(iconsDir, { recursive: true });

  await transparentIcon(192, path.join(iconsDir, "pwa-192.png"));
  await transparentIcon(512, path.join(iconsDir, "pwa-512.png"));
  await maskableIcon(512, path.join(iconsDir, "pwa-maskable-512.png"));

  // Next.js 파일 컨벤션: src/app/icon.png(파비콘), src/app/apple-icon.png(iOS 홈 화면)
  await maskableIcon(512, path.join(process.cwd(), "src", "app", "icon.png"));
  await maskableIcon(180, path.join(process.cwd(), "src", "app", "apple-icon.png"));

  console.log("PWA 아이콘 생성 완료: public/icons/*.png, src/app/icon.png, src/app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
