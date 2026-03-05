import type { ChangeEvent, RefObject } from "react";
import styles from "../page.module.css";

interface SearchControlsProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchTerm: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  quickKeywords: string[];
  onQuickKeywordClick: (keyword: string) => void;
}

export function SearchControls({
  searchInputRef,
  searchTerm,
  onInputChange,
  onClearSearch,
  quickKeywords,
  onQuickKeywordClick,
}: SearchControlsProps) {
  return (
    <div className={styles.searchContainer}>
      <input
        ref={searchInputRef}
        type="text"
        value={searchTerm}
        onChange={onInputChange}
        placeholder="Search for rules (e.g., trample, flying, commander...)"
        className={styles.searchInput}
      />
      {searchTerm && (
        <button
          onClick={onClearSearch}
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
          <span className={styles.hint}>
            Press <kbd>F</kbd> to favorite selected rule
          </span>
        </div>
      )}

      {quickKeywords.length > 0 && !searchTerm && (
        <div className={styles.quickKeywords}>
          {quickKeywords.map((keyword) => (
            <button
              key={keyword}
              className={styles.quickKeyword}
              onClick={() => onQuickKeywordClick(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
