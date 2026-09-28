import styles from "./DesktopMessage.module.css";

export default function DesktopMessage() {
  return (
    <div className={styles.desktopMessage}>
      <img
        src="/JobSeek Logo only - Black.png"
        alt="JobSeek"
        className={styles.logo}
      />

      <h2>JobSeek is mobile-only</h2>

      <p>
        Open JobSeek on your phone for the best experience.
      </p>
    </div>
  );
}