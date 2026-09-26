import "server-only";

const API_URL = "https://translation.googleapis.com/language/translate/v2";

export function isTranslationConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}

async function callTranslateApi(texts: string[], format: "text" | "html"): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set.");

  const res = await fetch(`${API_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target: "bn", format }),
  });

  if (!res.ok) {
    throw new Error(`Translation API request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { data: { translations: { translatedText: string }[] } };
  return data.data.translations.map((t) => t.translatedText);
}

/**
 * Translates plain-text strings (titles, deks) to Bengali in one request.
 * Empty strings are skipped rather than sent to the API and come back empty.
 */
export async function translateLines(lines: string[]): Promise<string[]> {
  const nonEmpty = lines
    .map((line, index) => ({ line, index }))
    .filter((entry) => entry.line.trim());
  if (nonEmpty.length === 0) return lines.map(() => "");

  const translated = await callTranslateApi(
    nonEmpty.map((entry) => entry.line),
    "text"
  );

  const result = lines.map(() => "");
  nonEmpty.forEach((entry, i) => {
    result[entry.index] = translated[i];
  });
  return result;
}

/** Translates article body HTML to Bengali, preserving markup structure. */
export async function translateHtml(html: string): Promise<string> {
  if (!html.trim()) return "";
  const [translated] = await callTranslateApi([html], "html");
  return translated;
}
