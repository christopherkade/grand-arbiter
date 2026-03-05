"use client";

import { useState } from "react";
import styles from "../page.module.css";
import type { RuleSection } from "@/lib/search";
import { getFavoriteRules } from "@/lib/favorites";
import { TopActionsNav } from "../components/TopActionsNav";

export default function RawRulesPage() {
  const [favoriteRules] = useState<RuleSection[]>(() => getFavoriteRules());

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TopActionsNav
          currentScreen="raw"
          favoriteCount={favoriteRules.length}
        />

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
