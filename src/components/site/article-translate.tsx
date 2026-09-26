"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { translateArticleToBengali } from "@/lib/articles/translate-actions";
import { cn } from "@/lib/cn";

type Translation = { title: string; dek: string | null; contentHtml: string | null };

type TranslateState = {
  lang: "en" | "bn";
  translation: Translation | null;
  pending: boolean;
  error: string | null;
  toggle: () => void;
};

const TranslateContext = createContext<TranslateState | null>(null);

function useArticleTranslate() {
  const ctx = useContext(TranslateContext);
  if (!ctx) throw new Error("Must be used within ArticleTranslateProvider");
  return ctx;
}

// Holds the English/Bangla toggle state so the title, dek, and body — which
// sit in different parts of the article page's markup, around the hero image
// and byline — can all switch language from one button.
export function ArticleTranslateProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    if (lang === "bn") {
      setLang("en");
      return;
    }
    if (translation) {
      setLang("bn");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await translateArticleToBengali(slug);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setTranslation(result);
      setLang("bn");
    });
  }

  return (
    <TranslateContext.Provider value={{ lang, translation, pending, error, toggle }}>
      {children}
    </TranslateContext.Provider>
  );
}

export function TranslateToggle() {
  const { lang, pending, error, toggle } = useArticleTranslate();
  const showingBanglaLabel = !pending && lang === "en";
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "label rounded-full border border-line px-3 py-1 text-ink hover:border-accent hover:text-accent",
          showingBanglaLabel && "lang-bn"
        )}
      >
        {pending ? "Translating…" : lang === "bn" ? "Read in English" : "বাংলায় পড়ুন"}
      </button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export function TranslatableTitle({ children: english }: { children: string }) {
  const { lang, translation } = useArticleTranslate();
  const showingBangla = lang === "bn" && translation;
  return (
    <h1
      className={cn(
        "text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl",
        showingBangla ? "font-bangla" : "font-display"
      )}
    >
      {showingBangla ? translation.title : english}
    </h1>
  );
}

export function TranslatableDek({ children: english }: { children: string }) {
  const { lang, translation } = useArticleTranslate();
  const showingBangla = lang === "bn" && translation;
  const text = showingBangla ? translation.dek : english;
  if (!text) return null;
  return (
    <p className={cn("text-xl text-muted", showingBangla ? "font-bangla" : "font-serif italic")}>
      {text}
    </p>
  );
}

export function TranslatableBody({ children: englishHtml }: { children: string }) {
  const { lang, translation } = useArticleTranslate();
  const showingBangla = lang === "bn" && translation;
  const html = showingBangla ? (translation.contentHtml ?? "") : englishHtml;
  return (
    <div
      className={cn("prose-article", showingBangla && "lang-bn")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
