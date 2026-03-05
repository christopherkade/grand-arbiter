import type { MutableRefObject } from "react";
import type { RuleSection } from "@/lib/search";
import styles from "../page.module.css";
import { FormattedRuleText } from "./FormattedRuleText";

interface RuleResultsAccordionProps {
  results: RuleSection[];
  expandedRules: Set<string>;
  searchTerm: string;
  ruleRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  onToggleRuleExpansion: (ruleId: string) => void;
  onRuleFocus: (index: number) => void;
  isRuleFavorited: (ruleId: string) => boolean;
  onToggleFavorite: (rule: RuleSection) => void;
}

export function RuleResultsAccordion({
  results,
  expandedRules,
  searchTerm,
  ruleRefs,
  onToggleRuleExpansion,
  onRuleFocus,
  isRuleFavorited,
  onToggleFavorite,
}: RuleResultsAccordionProps) {
  return (
    <div className={styles.results}>
      {results.map((rule, index) => (
        <div key={index} className={styles.ruleSection}>
          <button
            ref={(element) => {
              ruleRefs.current[index] = element;
            }}
            className={styles.ruleHeader}
            onClick={() => onToggleRuleExpansion(rule.id)}
            aria-expanded={expandedRules.has(rule.id)}
            onFocus={() => onRuleFocus(index)}
          >
            <h3 className={styles.ruleTitle}>
              <FormattedRuleText text={rule.title} searchTerm={searchTerm} />
            </h3>
            <div className={styles.ruleHeaderActions}>
              <span
                role="button"
                tabIndex={0}
                className={`${styles.favoriteButton} ${
                  isRuleFavorited(rule.id) ? styles.favoriteActive : ""
                }`}
                aria-label={
                  isRuleFavorited(rule.id)
                    ? `Remove ${rule.title} from favorites`
                    : `Add ${rule.title} to favorites`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(rule);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggleFavorite(rule);
                  }
                }}
              >
                {isRuleFavorited(rule.id) ? "★" : "☆"}
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
              <FormattedRuleText text={rule.content} searchTerm={searchTerm} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
