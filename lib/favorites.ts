import type { RuleSection } from "./search";

const FAVORITES_STORAGE_KEY = "grand-arbiter-favorite-rules";

function isValidRule(value: unknown): value is RuleSection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RuleSection>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string"
  );
}

export function getFavoriteRules(): RuleSection[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidRule);
  } catch (error) {
    console.error("Failed to read favorite rules:", error);
    return [];
  }
}

export function saveFavoriteRules(rules: RuleSection[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error("Failed to save favorite rules:", error);
  }
}
