"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { clientSearch, type RuleSection } from "../lib/search";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<RuleSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [focusedRuleIndex, setFocusedRuleIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ruleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-focus input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with '/' key
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Clear search with Escape
      if (e.key === "Escape") {
        if (searchTerm) {
          clearSearch();
        }
        return;
      }

      // Navigate results with arrow keys (only when search input is not focused)
      if (
        results.length > 0 &&
        document.activeElement !== searchInputRef.current
      ) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedRuleIndex((prev) => {
            const newIndex = prev < results.length - 1 ? prev + 1 : 0;
            ruleRefs.current[newIndex]?.focus();
            return newIndex;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedRuleIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : results.length - 1;
            ruleRefs.current[newIndex]?.focus();
            return newIndex;
          });
        } else if (e.key === "Enter" && focusedRuleIndex >= 0) {
          e.preventDefault();
          toggleRuleExpansion(results[focusedRuleIndex].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, results, focusedRuleIndex]);

  // Reset focused rule index when results change
  useEffect(() => {
    setFocusedRuleIndex(-1);
    ruleRefs.current = results.map(() => null);
  }, [results]);

  const searchRules = async (query: string) => {
    // Only search if query has at least 3 characters
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
      // Auto-expand all results when new search is performed
      const newExpanded = new Set<string>(
        (data.results || []).map((rule: RuleSection) => rule.id)
      );
      setExpandedRules(newExpanded);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSuggestion("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      searchRules(value);
    }, 500); // Increased debounce time to 500ms
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

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const quickKeywords = [
    "Trample",
    "Flying",
    "Commander",
    "Hexproof",
    "Deathtouch",
    "Vigilance",
    "Lifelink",
    "Haste",
  ];

  const handleQuickKeywordClick = (keyword: string) => {
    setSearchTerm(keyword);
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Trigger immediate search
    searchRules(keyword);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setSuggestion("");
    setFocusedRuleIndex(-1);
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Focus back to input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const applySuggestion = (suggestedTerm: string) => {
    setSearchTerm(suggestedTerm);
    setSuggestion("");
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Trigger immediate search
    searchRules(suggestedTerm);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Grand Arbiter</h1>
          <p className={styles.subtitle}>
            Your comprehensive Magic: The Gathering rules lookup tool. <br />
            Search for any keyword to find relevant rule sections instantly.
          </p>
        </div>

        <div className={styles.searchContainer}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for rules (e.g., trample, flying, commander...)"
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <div className={styles.searchHint}>
              Type at least 3 characters to search
            </div>
          )}

          {/* Keyboard hints - show when no search term */}
          {!searchTerm && (
            <div className={styles.keyboardHints}>
              <span className={styles.hint}>
                Press <kbd>/</kbd> to focus search
              </span>
              <span className={styles.hint}>
                Use <kbd>↑</kbd>
                <kbd>↓</kbd> to navigate results
              </span>
              <span className={styles.hint}>
                Press <kbd>Enter</kbd> to expand/collapse
              </span>
              <span className={styles.hint}>
                Press <kbd>Esc</kbd> to clear
              </span>
            </div>
          )}

          {/* Quick keywords - hide when search has results */}
          {results.length === 0 && !searchTerm && (
            <div className={styles.quickKeywords}>
              {quickKeywords.map((keyword) => (
                <button
                  key={keyword}
                  className={styles.quickKeyword}
                  onClick={() => handleQuickKeywordClick(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && <div className={styles.loading}>Searching rules...</div>}

        {/* Search result count */}
        {!isLoading && results.length > 0 && (
          <div className={styles.resultCount}>
            Found {results.length} rule{results.length === 1 ? "" : "s"} for
            &quot;{searchTerm}&quot;
          </div>
        )}

        {/* Did you mean suggestion */}
        {!isLoading && suggestion && results.length === 0 && (
          <div className={styles.suggestion}>
            Did you mean{" "}
            <button
              className={styles.suggestionLink}
              onClick={() => applySuggestion(suggestion)}
            >
              &quot;{suggestion}&quot;
            </button>
            ?
          </div>
        )}

        <div className={styles.results}>
          {results.map((rule, index) => (
            <div key={index} className={styles.ruleSection}>
              <button
                ref={(el) => {
                  ruleRefs.current[index] = el;
                }}
                className={styles.ruleHeader}
                onClick={() => toggleRuleExpansion(rule.id)}
                aria-expanded={expandedRules.has(rule.id)}
                onFocus={() => setFocusedRuleIndex(index)}
              >
                <h3 className={styles.ruleTitle}>
                  {highlightText(rule.title, searchTerm)}
                </h3>
                <span
                  className={`${styles.expandIcon} ${
                    expandedRules.has(rule.id) ? styles.expanded : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedRules.has(rule.id) && (
                <div className={styles.ruleContent}>
                  {highlightText(rule.content, searchTerm)}
                </div>
              )}
            </div>
          ))}
        </div>

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
