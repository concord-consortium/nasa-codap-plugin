import translations from ".";

export type Language = keyof typeof translations;
type Translation = typeof translations.en_us;
type TranslationKey = keyof Translation;
type MonthsTranslationKey = "~MONTHS" | "~MONTHS_SHORT" | "~MONTHS_MIXED";
type SimpleTranslationKey = Exclude<TranslationKey, MonthsTranslationKey>;

const defaultLang = "en_us",
      varRegExp = /\$\{\s*(\d+)\s*\}/g,
      error = "** TRANSLATION ERROR **";

function translateString(key: MonthsTranslationKey, lang: Language): string[];
function translateString(key: SimpleTranslationKey, lang: Language): string;
function translateString(key: TranslationKey, lang: Language): string | string[] {
  return translations[lang]?.[key] || key;
}

/**
 * Translates strings if they exist in the language file. Otherwise, passes back
 * string unchanged.
 * You can also pass an array of strings, where the first is the main text, and
 * the others are variables to be placed in the string:
 *   ["Good ${0}, ${1}", "evening", "User"]
 * will return "Good evening, User". Each string in the array may optionally be
 * in the language file:
 *   ["~TIME_SENSITIVE_GREETING", "~TIME.EVENING", "User"]
 */
export function translate(key: MonthsTranslationKey, lang: Language): string[];
export function translate(key: SimpleTranslationKey, lang: Language): string;
export function translate(key: string[], language: Language): string;
export function translate(key: TranslationKey | string[], lang: Language = defaultLang) {
  if (typeof key === "string") {
    return translateString(key as any, lang);
  } else if (Array.isArray(key)) {
    // cast because variable replacement can't be used with array entries like months
    const translation = translateString(key[0] as SimpleTranslationKey, lang) as string;
    return translation.replace(varRegExp, (match: string, id: number) =>
      key[++id] ? translateString(key[id] as SimpleTranslationKey, lang) as string : error);
  } else if (key != null) {
    console.log("Could not translate: ", key);
  }
  return error;
}

export default translate;
