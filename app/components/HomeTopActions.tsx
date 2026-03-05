import Link from "next/link";
import styles from "../page.module.css";

interface HomeTopActionsProps {
  favoriteCount: number;
}

export function HomeTopActions({ favoriteCount }: HomeTopActionsProps) {
  return (
    <div className={styles.topActions}>
      <Link href="/raw" className={styles.viewToggleButton}>
        View Raw Rules
      </Link>
      <Link href="/favorites" className={styles.favoritesLinkButton}>
        Favorites ({favoriteCount})
      </Link>
    </div>
  );
}
