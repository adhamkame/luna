import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { isSpecialDate, parseDate } = await loadTypeScript("../src/utils/date.ts");
const { siteContent } = await loadTypeScript("../src/content.ts");
const special = { day: 1, month: 7 };
const accepted = [
  "1/7", "01/07", "1-7", "01-07", "1 / 7", "1.7", "1–7",
  "1 يوليو", "١ يوليو", "١/٧", "۱/۷",
  "01/07/2024", "1-7-2024", "01-07-24", "2024-07-01", "2024-7-1",
  "July 1", "july 1", "July 1st", "July 1, 2024", "1 July 2024", "1st July 2024",
  "1 يوليو 2024", "١  يوليو ٢٠٢٤", " ‏١ / ٧ ‌", "１／７", "2000-07-01", "0000-07-01",
];
for (const value of accepted) {
  test(`يقبل التاريخ: ${value}`, () => {
    assert.equal(isSpecialDate(value, special), true, value);
    assert.deepEqual(parseDate(value), { day: 1, month: 7 });
  });
}
const wrong = ["2/7", "7/1", "01/08", "1 أغسطس", "August 1", "2024-07-02", "", "   ", "hello", "1", "July", "32/1", "1/13", "0/7", "1/0", "2024-07-32", "1 July 2024 extra"];
for (const value of wrong) {
  test(`يرفض التاريخ غير الصحيح: ${value || "نص فارغ"}`, () => assert.equal(isSpecialDate(value, special), false, value));
}
test("الأرقام العربية والمسافات لا تمنع قبول التاريخ، والسنة متجاهلة", () => {
  assert.equal(isSpecialDate(" ١   يوليو ٢٠٢٤ ", special), true);
  for (const year of ["1999", "2024", "2025", "0000"]) assert.equal(isSpecialDate(`01/07/${year}`, special), true);
});
test("المدقق يستخدم اليوم والشهر في الإعدادات، وليس قيمة ثابتة", () => {
  assert.equal(isSpecialDate("2/7", { day: 2, month: 7 }), true);
  assert.equal(isSpecialDate("1/7", { day: 2, month: 7 }), false);
  assert.equal(isSpecialDate("1/7", { day: 1, month: 8 }), false);
});
test("الإعدادات: التاريخ والنصوص المؤقتة و4–6 صور سليمة", () => {
  assert.deepEqual(siteContent.specialDate, { day: 1, month: 7 });
  assert.equal(siteContent.firstMessage, "اكتبي هنا رسالتك الأولى ليها...");
  assert.equal(siteContent.happyMessage, "اكتبي هنا الـ Happy Message اللي عايزة توصليهلها...");
  assert.equal(siteContent.errors.firstWrong, "حاولي تاني يا حمارة");
  assert.equal(siteContent.errors.secondWrong, "حاولي تاني يا بقرة");
  assert.ok(siteContent.photos.length >= 4 && siteContent.photos.length <= 6);
  for (const photo of siteContent.photos) { assert.equal(typeof photo.src, "string"); assert.equal(typeof photo.alt, "string"); assert.equal(typeof photo.caption, "string"); }
});
