/** تطبيع الأرقام العربية والفارسية والمسافات، من غير تغيير معنى التاريخ. */
export function normalizeDate(value: string): string {
  const digits = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";
  let result = "";
  for (const character of value.normalize("NFKC").toLowerCase()) {
    const digit = digits.indexOf(character);
    if (digit !== -1) {
      result += String(digit % 10);
    } else if (/[\u064b-\u065f\u0670\u0640]/.test(character) || /[\u200c-\u200f\u202a-\u202e\u2066-\u2069]/.test(character)) {
      continue;
    } else if (character === "-" || character === "–" || character === "—" || character === "−") {
      result += "-";
    } else if (/\s/.test(character)) {
      result += " ";
    } else {
      result += character;
    }
  }
  while (result.includes("--")) result = result.replace("--", "-");
  return result.trim();
}

const months: Record<string, number> = {
  january: 1, jan: 1, "يناير": 1,
  february: 2, feb: 2, "فبراير": 2, "برير": 2,
  march: 3, mar: 3, "مارس": 3,
  april: 4, apr: 4, "أبريل": 4, "ابريل": 4,
  may: 5, "مايو": 5,
  june: 6, jun: 6, "يونيو": 6,
  july: 7, jul: 7, "يوليو": 7, "يوليه": 7, "يولية": 7, "تموز": 7,
  august: 8, aug: 8, "أغسطس": 8, "اغسطس": 8, "غشت": 8,
  september: 9, sep: 9, sept: 9, "سبتمبر": 9,
  october: 10, oct: 10, "أكتوبر": 10, "اكتوبر": 10,
  november: 11, nov: 11, "نوفمبر": 11,
  december: 12, dec: 12, "ديسمبر": 12,
};
const monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export type ParsedDate = { day: number; month: number };

/** يوم/شهر، واسم الشهر بالعربي أو الإنجليزي، وISO. السنة اختيارية ومتجاهلة. */
export function parseDate(value: string): ParsedDate | null {
  const input = normalizeDate(value);
  if (!input) return null;

  const iso = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) return validDate(Number(iso[3]), Number(iso[2]));

  const numeric = input.match(/^(\d{1,2})\s*[-/.]\s*(\d{1,2})(?:\s*[-/.]\s*(?:\d{4}|\d{2}))?$/);
  if (numeric) return validDate(Number(numeric[1]), Number(numeric[2]));

  // قراءة الكلمات بدون الاعتماد على ترتيب الالتقاط في regex اسم الشهر.
  const tokens = input.split(" ").flatMap((token) => token.split(",")).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 3) return null;
  let day: number | undefined;
  let month: number | undefined;
  for (let token of tokens) {
    if (/^\d{1,2}(?:st|nd|rd|th)$/.test(token)) token = token.slice(0, -2);
    if (/^\d{1,2}$/.test(token)) {
      if (day !== undefined) return null;
      day = Number(token);
    } else if (/^\d{4}$/.test(token)) {
      continue; // السنة لا تدخل في المقارنة.
    } else {
      if (!Object.prototype.hasOwnProperty.call(months, token)) return null;
      if (month !== undefined) return null;
      month = months[token];
    }
  }
  return day !== undefined && month !== undefined ? validDate(day, month) : null;
}

function validDate(day: number, month: number): ParsedDate | null {
  if (!Number.isInteger(day) || !Number.isInteger(month) || month < 1 || month > 12 || day < 1) return null;
  // فبراير 29 مسموح؛ السنة غير مطلوبة، لذلك لا نربطها بسنة كبيسة معينة.
  return day <= monthLengths[month - 1] ? { day, month } : null;
}

export function isSpecialDate(value: string, specialDate: { day: number; month: number }): boolean {
  const parsed = parseDate(value);
  return parsed?.day === specialDate.day && parsed?.month === specialDate.month;
}
