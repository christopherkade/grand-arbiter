import styles from "../page.module.css";

interface SearchStatusProps {
  isLoading: boolean;
  resultsLength: number;
  searchTerm: string;
  suggestion: string;
  onApplySuggestion: (suggestion: string) => void;
}

export function SearchStatus({
  isLoading,
  resultsLength,
  searchTerm,
  suggestion,
  onApplySuggestion,
}: SearchStatusProps) {
  return (
    <>
      {isLoading && <div className={styles.loading}>Searching rules...</div>}

      {!isLoading && resultsLength > 0 && (
        <div className={styles.resultCount}>
          Found {resultsLength} result{resultsLength === 1 ? "" : "s"} for
          &quot;{searchTerm}&quot;
        </div>
      )}

      {!isLoading && suggestion && resultsLength === 0 && (
        <div className={styles.suggestion}>
          Did you mean{" "}
          <button
            className={styles.suggestionLink}
            onClick={() => onApplySuggestion(suggestion)}
          >
            &quot;{suggestion}&quot;
          </button>
          ?
        </div>
      )}
    </>
  );
}
