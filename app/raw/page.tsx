"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../page.module.css";
import type { RuleSection } from "@/lib/search";
import { getFavoriteRules } from "@/lib/favorites";

export default function RawRulesPage() {
  const [favoriteRules] = useState<RuleSection[]>(() => getFavoriteRules());

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topActions}>
          <Link href="/" replace className={styles.favoritesLinkButton}>
            Back to Search
          </Link>
          <Link href="/favorites" className={styles.viewToggleButton}>
            Favorites ({favoriteRules.length})
          </Link>
        </div>

        <div className={styles.rawView}>
          <iframe
            src="/rules.txt"
            title="Raw rules.txt content"
            className={styles.rawFrame}
          />
        </div>
      </main>
    </div>
  );
}
