"use client";

import { useState } from "react";
import styles from "../page.module.css";
import type { RuleSection } from "@/lib/search";
import { getFavoriteRules, saveFavoriteRules } from "@/lib/favorites";
import { TopActionsNav } from "../components/TopActionsNav";

export default function FavoritesPage() {
  const [favoriteRules, setFavoriteRules] = useState<RuleSection[]>(() =>
    getFavoriteRules(),
  );
  const [expandedRules, setExpandedRules] = useState<Set<string>>(
    () => new Set(getFavoriteRules().map((rule) => rule.id)),
  );

  const toggleRuleExpansion = (ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const removeFavoriteRule = (ruleId: string) => {
    setFavoriteRules((prev) => {
      const updated = prev.filter((rule) => rule.id !== ruleId);
      saveFavoriteRules(updated);
      return updated;
    });

    setExpandedRules((prev) => {
      const next = new Set(prev);
      next.delete(ruleId);
      return next;
    });
  };

  const formatRuleText = (text: string) => {
    const ruleIdentifierRegex = /(\b\d{3}\.\d+[a-z]?\b)/gi;

    return text
      .split(ruleIdentifierRegex)
      .filter((part) => part.length > 0)
      .map((part, index) => {
        if (/^\d{3}\.\d+[a-z]?$/i.test(part)) {
          return <strong key={`identifier-${index}`}>{part}</strong>;
        }

        return <span key={`text-${index}`}>{part}</span>;
      });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TopActionsNav
          currentScreen="favorites"
          favoriteCount={favoriteRules.length}
        />

        <div className={styles.header}>
          <h1 className={styles.title}>Grand Arbiter</h1>
          <p className={styles.subtitle}>
            Your comprehensive Magic: The Gathering rules lookup tool. <br />
            Saved rules are listed below.
          </p>
        </div>

        <div className={styles.results}>
          {favoriteRules.map((rule, index) => (
            <div key={rule.id || index} className={styles.ruleSection}>
              <button
                className={styles.ruleHeader}
                onClick={() => toggleRuleExpansion(rule.id)}
                aria-expanded={expandedRules.has(rule.id)}
              >
                <h3 className={styles.ruleTitle}>
                  {formatRuleText(rule.title)}
                </h3>
                <div className={styles.ruleHeaderActions}>
                  <span
                    role="button"
                    tabIndex={0}
                    className={`${styles.favoriteButton} ${styles.favoriteActive}`}
                    aria-label={`Remove ${rule.title} from favorites`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFavoriteRule(rule.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        removeFavoriteRule(rule.id);
                      }
                    }}
                  >
                    ★
                  </span>
                  <span
                    className={`${styles.expandIcon} ${
                      expandedRules.has(rule.id) ? styles.expanded : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </button>
              {expandedRules.has(rule.id) && (
                <div className={styles.ruleContent}>
                  {formatRuleText(rule.content)}
                </div>
              )}
            </div>
          ))}
        </div>

        {favoriteRules.length === 0 && (
          <div className={styles.noResults}>
            You have no favorite rules yet. Star a rule in search results to
            save it.
          </div>
        )}
      </main>
    </div>
  );
}
