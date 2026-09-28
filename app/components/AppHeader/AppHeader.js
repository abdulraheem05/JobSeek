"use client";

import Image from "next/image";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        <img
          src="/JobSeek Straightline.png"
          alt="JobSeek"
          className={styles.logo}
        />
      </div>
    </header>
  );
}