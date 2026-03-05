import styles from "../page.module.css";

interface FormattedRuleTextProps {
  text: string;
  searchTerm?: string;
}

export function FormattedRuleText({
  text,
  searchTerm = "",
}: FormattedRuleTextProps) {
  const trimmedSearchTerm = searchTerm.trim();
  const escapedSearchTerm = trimmedSearchTerm.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const searchSplitRegex = trimmedSearchTerm
    ? new RegExp(`(${escapedSearchTerm})`, "gi")
    : null;
  const searchExactRegex = trimmedSearchTerm
    ? new RegExp(`^${escapedSearchTerm}$`, "i")
    : null;

  const highlightPart = (partText: string, keyPrefix: string) => {
    if (!searchSplitRegex || !searchExactRegex) {
      return [partText];
    }

    return partText
      .split(searchSplitRegex)
      .filter((part) => part.length > 0)
      .map((part, index) =>
        searchExactRegex.test(part) ? (
          <mark key={`${keyPrefix}-mark-${index}`} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          <span key={`${keyPrefix}-text-${index}`}>{part}</span>
        ),
      );
  };

  const ruleIdentifierRegex = /(\b\d{3}\.\d+[a-z]?\b)/gi;

  return (
    <>
      {text
        .split(ruleIdentifierRegex)
        .filter((part) => part.length > 0)
        .map((part, index) => {
          const content = highlightPart(part, `part-${index}`);

          if (/^\d{3}\.\d+[a-z]?$/i.test(part)) {
            return <strong key={`identifier-${index}`}>{content}</strong>;
          }

          return <span key={`text-${index}`}>{content}</span>;
        })}
    </>
  );
}
