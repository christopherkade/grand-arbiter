import styles from "../page.module.css";
import type { ReactNode } from "react";

interface SiteHeaderProps {
  subtitle: ReactNode;
}

export function SiteHeader({ subtitle }: SiteHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Grand Arbiter</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
