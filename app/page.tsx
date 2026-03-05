"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { clientSearch, type RuleSection } from "@/lib/search";
import { getFavoriteRules, saveFavoriteRules } from "@/lib/favorites";
import { SiteHeader } from "./components/SiteHeader";
import { TopActionsNav } from "./components/TopActionsNav";
import { SearchControls } from "./components/SearchControls";
import { SearchStatus } from "./components/SearchStatus";
import { RuleResultsAccordion } from "./components/RuleResultsAccordion";

export default function Home() {
  const SEARCH_QUERY_PARAM = "q";
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<RuleSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [focusedRuleIndex, setFocusedRuleIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState<string>("");
  const [favoriteRules, setFavoriteRules] = useState<RuleSection[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ruleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const quickKeywords = [
    "Trample",
    "Flying",
    "Hexproof",
    "Deathtouch",
    "Vigilance",
    "Lifelink",
    "Haste",
  ];

  const updateSearchParam = (value: string) => {
    const url = new URL(window.location.href);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      url.searchParams.set(SEARCH_QUERY_PARAM, value);
    } else {
      url.searchParams.delete(SEARCH_QUERY_PARAM);
    }

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  const toggleRuleExpansion = (ruleId: string) => {
    setExpandedRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  const searchRules = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      setSuggestion("");
      return;
    }

    setIsLoading(true);
    try {
      const data = await clientSearch(query);
      setResults(data.results || []);
      setSuggestion(data.suggestion || "");
      setExpandedRules(
        new Set<string>(
          (data.results || []).map((rule: RuleSection) => rule.id),
        ),
      );
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSuggestion("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateSearchParam("");
    setResults([]);
    setSuggestion("");
    setFocusedRuleIndex(-1);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    searchInputRef.current?.focus();
  };

  // Auto-focus input on page load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Reset focused rule index when results change
  useEffect(() => {
    setFocusedRuleIndex(-1);
    ruleRefs.current = results.map(() => null);
  }, [results]);

  // Load favorites from localStorage.
  useEffect(() => {
    setFavoriteRules(getFavoriteRules());
  }, []);

  // Hydrate search term from shared URL on first load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get(SEARCH_QUERY_PARAM);

    if (!queryFromUrl) {
      return;
    }

    setSearchTerm(queryFromUrl);
    searchRules(queryFromUrl);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement !== searchInputRef.current
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "Escape") {
        if (searchTerm) {
          setSearchTerm("");
          updateSearchParam("");
          setResults([]);
          setSuggestion("");
          setFocusedRuleIndex(-1);
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          searchInputRef.current?.focus();
        }
        return;
      }

      if (
        results.length > 0 &&
        document.activeElement !== searchInputRef.current
      ) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setFocusedRuleIndex((prev) => {
            const newIndex = prev < results.length - 1 ? prev + 1 : 0;
            ruleRefs.current[newIndex]?.focus();
            return newIndex;
          });
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setFocusedRuleIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : results.length - 1;
            ruleRefs.current[newIndex]?.focus();
            return newIndex;
          });
        } else if (event.key === "Enter" && focusedRuleIndex >= 0) {
          event.preventDefault();
          toggleRuleExpansion(results[focusedRuleIndex].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedRuleIndex, results, searchTerm]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateSearchParam(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchRules(value);
    }, 500);
  };

  const isRuleFavorited = (ruleId: string) => {
    return favoriteRules.some((rule) => rule.id === ruleId);
  };

  const toggleFavoriteRule = (rule: RuleSection) => {
    setFavoriteRules((prev) => {
      const isFavorited = prev.some(
        (favoriteRule) => favoriteRule.id === rule.id,
      );
      const updated = isFavorited
        ? prev.filter((favoriteRule) => favoriteRule.id !== rule.id)
        : [...prev, rule];

      saveFavoriteRules(updated);
      return updated;
    });
  };

  const handleQuickKeywordClick = (keyword: string) => {
    setSearchTerm(keyword);
    updateSearchParam(keyword);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    searchRules(keyword);
  };

  const applySuggestion = (suggestedTerm: string) => {
    setSearchTerm(suggestedTerm);
    updateSearchParam(suggestedTerm);
    setSuggestion("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    searchRules(suggestedTerm);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SiteHeader
          subtitle={
            <>
              Your comprehensive Magic: The Gathering rules lookup tool. <br />
              Search for any keyword to find relevant rule sections instantly.
            </>
          }
        />

        <TopActionsNav
          currentScreen="search"
          favoriteCount={favoriteRules.length}
        />

        <SearchControls
          searchInputRef={searchInputRef}
          searchTerm={searchTerm}
          onInputChange={handleInputChange}
          onClearSearch={clearSearch}
          quickKeywords={results.length === 0 ? quickKeywords : []}
          onQuickKeywordClick={handleQuickKeywordClick}
        />

        <SearchStatus
          isLoading={isLoading}
          resultsLength={results.length}
          searchTerm={searchTerm}
          suggestion={suggestion}
          onApplySuggestion={applySuggestion}
        />

        <RuleResultsAccordion
          results={results}
          expandedRules={expandedRules}
          searchTerm={searchTerm}
          ruleRefs={ruleRefs}
          onToggleRuleExpansion={toggleRuleExpansion}
          onRuleFocus={setFocusedRuleIndex}
          isRuleFavorited={isRuleFavorited}
          onToggleFavorite={toggleFavoriteRule}
        />

        {searchTerm &&
          searchTerm.length >= 3 &&
          !isLoading &&
          results.length === 0 && (
            <div className={styles.noResults}>
              No rules found for &quot;{searchTerm}&quot;. Try different
              keywords.
            </div>
          )}
      </main>
    </div>
  );
}
