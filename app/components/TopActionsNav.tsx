import Link from "next/link";
import styles from "../page.module.css";

type ScreenName = "search" | "raw" | "favorites";

interface TopActionsNavProps {
  currentScreen: ScreenName;
  favoriteCount: number;
}

export function TopActionsNav({
  currentScreen,
  favoriteCount,
}: TopActionsNavProps) {
  const isRawScreen = currentScreen === "raw";
  const isFavoritesScreen = currentScreen === "favorites";

  return (
    <div className={styles.topActions}>
      <Link
        href={isRawScreen ? "/" : "/raw"}
        replace={isRawScreen}
        className={styles.viewToggleButton}
      >
        {isRawScreen ? "Back to Search" : "View Raw Rules"}
      </Link>
      <Link
        href={isFavoritesScreen ? "/" : "/favorites"}
        replace={isFavoritesScreen}
        className={styles.favoritesLinkButton}
      >
        {isFavoritesScreen ? "Back to Search" : `Favorites (${favoriteCount})`}
      </Link>
    </div>
  );
}
