import { createContext, useContext, useMemo, type ReactNode } from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import type { Language } from "@/data/types";

const translations: Record<Language, unknown> = { en, ar };

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  /** Returns the string at `path`, or the path itself when missing (makes gaps visible). */
  t: (path: string) => string;
  /** Returns the array at `path`, or an empty array when missing or not an array. */
  tList: <T>(path: string) => T[];
  /** URL of the current page in the other language. */
  switchHref: string;
  /** Navigates to the current page in `lang`. */
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function lookup(language: Language, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node)
      return (node as Record<string, unknown>)[key];
    return undefined;
  }, translations[language]);
}

interface LanguageProviderProps {
  /** Language is decided by the URL (`/` = Arabic, `/en/` = English), never by stored preference. */
  language: Language;
  /** Href of the same page in the other language. */
  switchHref: string;
  children: ReactNode;
}

export function LanguageProvider({
  language,
  switchHref,
  children,
}: LanguageProviderProps) {
  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      isRTL: language === "ar",
      switchHref,
      t: path => {
        const found = lookup(language, path);
        return typeof found === "string" ? found : path;
      },
      tList: <T,>(path: string) => {
        const found = lookup(language, path);
        return Array.isArray(found) ? (found as T[]) : [];
      },
      setLanguage: lang => {
        if (lang !== language) window.location.assign(switchHref);
      },
    }),
    [language, switchHref]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
