import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const baseURL = process.env.LUNA_TEST_URL || "http://127.0.0.1:5173";
let browser;
before(async () => { browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] }); });
after(async () => { if (browser) await browser.close(); });

async function openPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 360, height: 800 }, ...options });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { page, context };
}
async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    smallButtons: [...document.querySelectorAll("button")].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && (rect.width < 43.9 || rect.height < 43.9);
    }).map((button) => ({ text: button.textContent, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })),
  }));
  assert.ok(dimensions.document <= dimensions.viewport, `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
  assert.ok(dimensions.body <= dimensions.viewport, `${label}: body overflow ${JSON.stringify(dimensions)}`);
  assert.deepEqual(dimensions.smallButtons, [], `${label}: touch targets should be at least 44px`);
}
async function answerCorrectly(page, value = "١/٧") {
  await page.getByLabel("التاريخ اللي بدأ الحكاية").fill(value);
  await page.getByLabel("التاريخ اللي بدأ الحكاية").press("Enter");
  await expect(page.getByRole("heading", { name: "كنت عارفة إنكِ هتفتكري." })).toBeVisible();
}
async function goToMemories(page) {
  await answerCorrectly(page);
  await page.getByRole("button", { name: "كمّلي", exact: true }).click();
  await expect(page.getByRole("heading", { name: /أحلى لحظاتك/ })).toBeVisible();
  await expect(page.locator(".polaroid")).toHaveCount(4);
}
async function changeTestPhoto(page, src, caption) {
  // تعديل للاختبار فقط، في وحدة الصفحة؛ لا يغيّر ملف الإعدادات ولا يحفظ شيئًا.
  await page.evaluate(async ({ src, caption }) => {
    const content = await import("/src/content.ts");
    content.siteContent.photos[0].src = src;
    content.siteContent.photos[0].caption = caption;
  }, { src, caption });
  await page.getByRole("button", { name: /بداية الحكاية/ }).click();
  await goToMemories(page);
}

test("الموبايل والكمبيوتر: البداية فقط، RTL، محلي، بدون تمرير أفقي", { timeout: 120000 }, async () => {
  await mkdir("tests/artifacts", { recursive: true });
  const externalRequests = [];
  for (const width of [360, 390, 768, 1024, 1440]) {
    const { page, context } = await openPage({ viewport: { width, height: width < 768 ? 800 : 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith(baseURL)) externalRequests.push(request.url()); });
    await expect(page).toHaveTitle("Luna — حاجة حلوة ليكي");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".heart-stage, .story-page")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /رسالة ليكي/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /لحظاتنا/ })).toBeDisabled();
    await expect(page.locator(".hero-art-image")).toBeVisible();
    assert.ok(await page.locator(".hero-art-image").evaluate((image) => image.complete && image.naturalWidth > 0));
    await noOverflow(page, `${width}px initial screen`);
    if (width === 360 || width === 1440) await page.screenshot({ path: `tests/artifacts/luna-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  }
  assert.deepEqual(externalRequests, [], "All fonts and images should be local");
});

test("خطأ أول وثاني وخامس وعاشر: الرسائل المطلوبة، والمحاولات لا تنتهي", async () => {
  const { page, context } = await openPage();
  const input = page.getByLabel("التاريخ اللي بدأ الحكاية");
  await input.fill("   ");
  await page.getByRole("button", { name: "يلا نفتكر", exact: true }).click();
  await expect(page.locator("#date-feedback")).toHaveText("اكتبي التاريخ الأول 💗");
  for (let index = 0; index < 10; index++) {
    await input.fill("2/8");
    await input.press("Enter");
    await expect(page.locator("#date-feedback")).toHaveText(index === 0 ? "حاولي تاني يا حمارة" : "حاولي تاني يا بقرة");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(".heart-stage")).toHaveCount(0);
  }
  await noOverflow(page, "360px errors");
  await answerCorrectly(page);
  await expect(page.locator("#date-feedback")).toHaveCount(0);
  await context.close();
});

test("الصيغ المقبولة تفتح القلب بـ Enter، من غير اشتراط السنة", { timeout: 120000 }, async () => {
  const { page, context } = await openPage();
  for (const value of ["1/7", "01/07", "1-7", "01-07", "1 يوليو", "١/٧", "July 1", "01/07/2024", "2024-07-01", " ١  يوليو ٢٠٢٤ "]) {
    await answerCorrectly(page, value);
    await expect(page.locator(".welcome-message")).toHaveText("اكتبي هنا رسالتك الأولى ليها...");
    await expect(page.getByRole("button", { name: /رسالة ليكي/ })).toBeDisabled();
    await page.getByRole("button", { name: /بداية الحكاية/ }).click();
    await expect(page.getByLabel("التاريخ اللي بدأ الحكاية")).toHaveValue("");
  }
  await context.close();
});

test("رحلة موبايل كاملة: 4 أماكن، الرسالة الأخيرة، ونرجع من الأول", async () => {
  const { page, context } = await openPage({ isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await goToMemories(page);
  await expect(page.locator(".empty-photo")).toHaveCount(4);
  await expect(page.locator(".memory-grid img")).toHaveCount(0);
  await noOverflow(page, "360px memories");
  await page.screenshot({ path: "tests/artifacts/luna-memories.png", fullPage: true });
  await page.getByRole("button", { name: "كمّلي الحكاية", exact: true }).tap();
  await expect(page.locator(".happy-message")).toHaveText("اكتبي هنا الـ Happy Message اللي عايزة توصليهلها...");
  await noOverflow(page, "360px letter");
  await page.getByRole("button", { name: "نرجع من الأول", exact: true }).tap();
  await expect(page.getByLabel("التاريخ اللي بدأ الحكاية")).toHaveValue("");
  await expect(page.locator(".story-page")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /لحظاتنا/ })).toBeDisabled();
  const input = page.getByLabel("التاريخ اللي بدأ الحكاية");
  await input.fill("2/8"); await input.press("Enter");
  await expect(page.locator("#date-feedback")).toHaveText("حاولي تاني يا حمارة");
  await input.fill("2/8"); await input.press("Enter");
  await expect(page.locator("#date-feedback")).toHaveText("حاولي تاني يا بقرة");
  await answerCorrectly(page);
  await expect(page.getByRole("button", { name: /لحظاتنا/ })).toBeEnabled();
  await page.getByRole("button", { name: "كمّلي", exact: true }).tap();
  await expect(page.getByRole("button", { name: /رسالة ليكي/ })).toBeEnabled();
  await page.getByRole("button", { name: /رسالة ليكي/ }).tap();
  await expect(page.locator(".happy-message")).toBeInViewport();
  await page.getByRole("button", { name: "نرجع من الأول", exact: true }).tap();
  await expect(input).toHaveValue("");
  await expect(page.locator(".error-message")).toHaveCount(0);
  assert.deepEqual(errors, []);
  await context.close();
});

test("صور فعلية وفارغة: تكبير، تعليق اختياري، Escape وحبس التركيز", async () => {
  const { page, context } = await openPage();
  await changeTestPhoto(page, "/images/luna-universe.webp", "ضحكة صغيرة");
  const photo = page.getByRole("button", { name: "كبّري الصورة: أول فرادة", exact: true });
  await expect(photo).toBeVisible();
  await photo.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", "/images/luna-universe.webp");
  assert.ok(await dialog.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0));
  await expect(dialog.locator(".lightbox-caption")).toHaveText("ضحكة صغيرة");
  const close = page.getByRole("button", { name: "إغلاق", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab"); await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(close).toBeFocused();
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0);
  await expect(photo).toBeFocused();
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
  await noOverflow(page, "360px loaded photo");
  await photo.click();
  await page.locator(".lightbox-backdrop").click({ position: { x: 3, y: 3 } });
  await expect(dialog).toHaveCount(0);
  await changeTestPhoto(page, "/images/missing-memory-test.jpg", "");
  await expect(page.locator(".memory-grid img")).toHaveCount(0);
  await expect(page.locator(".empty-photo")).toHaveCount(4);
  await expect(page.locator(".polaroid--filled")).toHaveCount(0);
  await noOverflow(page, "360px failed image");
  await context.close();
});

test("تقليل الحركة: لا قصاصات ولا حركة زخرفية، وكل المرحلة تعمل", async () => {
  const { page, context } = await openPage({ reducedMotion: "reduce" });
  assert.equal(await page.locator(".hero-art-image").evaluate((image) => getComputedStyle(image).animationName), "none");
  await answerCorrectly(page);
  await expect(page.locator(".heart-confetti")).toBeHidden();
  assert.equal(await page.locator(".heart-artwork").evaluate((heart) => getComputedStyle(heart).animationName), "none");
  await page.getByRole("button", { name: "كمّلي", exact: true }).click();
  await expect(page.locator(".happy-message")).toBeVisible();
  assert.equal(await page.locator(".letter-card").evaluate((card) => getComputedStyle(card.parentElement).opacity), "1");
  await noOverflow(page, "reduced motion");
  await context.close();
});
