"use client";

import {
  Bell,
  Bookmark,
  Globe2,
  UserRound,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./BottomNavigation.module.css";

const MAIN_ROUTES = [
  "/home",
  "/saved",
  "/career",
];

function getActiveIndex(pathname) {
  const index = MAIN_ROUTES.indexOf(pathname);

  return index === -1 ? null : index;
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const activeIndex = getActiveIndex(pathname);

  const isProfile =
    pathname === "/profile";

  /*
   * The navigation should only exist on the
   * main application pages.
   *
   * It will NOT appear on:
   * /login
   * /onboarding
   * /
   */
  const shouldShow =
    MAIN_ROUTES.includes(pathname) ||
    isProfile;

  /*
   * IMPORTANT:
   *
   * This component now lives in layout.js,
   * so it remains mounted while Next.js
   * changes between /home, /saved and /career.
   *
   * That means this state survives navigation.
   */
  const initialIndex =
    activeIndex ?? 0;

  const previousIndexRef =
    useRef(initialIndex);

  const [indicatorIndex, setIndicatorIndex] =
    useState(initialIndex);

  /*
   * When the route changes:
   *
   * Old:
   * indicatorIndex = 0
   *
   * New:
   * indicatorIndex = 1
   *
   * The SAME DOM element receives a new
   * transform value, allowing CSS to
   * physically animate it.
   */
  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    if (
      activeIndex ===
      previousIndexRef.current
    ) {
      return;
    }

    previousIndexRef.current =
      activeIndex;

    setIndicatorIndex(activeIndex);
  }, [activeIndex]);

  if (!shouldShow) {
    return null;
  }

  /*
   * We use separate classes rather than
   * calculating translateX with JavaScript.
   *
   * Each class moves the SAME indicator.
   */
  const indicatorPositionClass =
    indicatorIndex === 0
      ? styles.indicatorHome
      : indicatorIndex === 1
      ? styles.indicatorSaved
      : styles.indicatorCareer;

  /*
   * On profile, the blue profile button is
   * active, so the white circle is hidden.
   */
  const navClassName = `
    ${styles.bottomNav}
    ${isProfile ? styles.profileMainNav : ""}
  `;

  return (
    <div
      className={styles.navigationWrapper}
    >
      <nav
        className={navClassName}
        aria-label="Main navigation"
      >
        {/*
          ONE SINGLE WHITE INDICATOR.

          It is NOT inside any NavItem.

          This is what allows the circle to
          physically travel between icons.
        */}
        <span
          className={`
            ${styles.activeIndicator}
            ${indicatorPositionClass}
          `}
          aria-hidden="true"
        />

        <NavItem
          active={
            pathname === "/home"
          }
          onClick={() =>
            router.push("/home")
          }
          icon={<Bell />}
          label="Alerts"
        />

        <NavItem
          active={
            pathname === "/saved"
          }
          onClick={() =>
            router.push("/saved")
          }
          icon={<Bookmark />}
          label="Saved"
        />

        <NavItem
          active={
            pathname === "/career"
          }
          onClick={() =>
            router.push("/career")
          }
          icon={<Globe2 />}
          label="Career"
        />
      </nav>

      <button
        type="button"
        className={`
          ${styles.profileNavButton}
          ${
            isProfile
              ? styles.profileNavActive
              : ""
          }
        `}
        onClick={() =>
          router.push("/profile")
        }
        aria-label="Open profile"
        aria-current={
          isProfile
            ? "page"
            : undefined
        }
      >
        <UserRound size={19} />
      </button>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      className={`
        ${styles.navItem}
        ${
          active
            ? styles.navItemActive
            : ""
        }
      `}
      onClick={onClick}
      aria-label={label}
      aria-current={
        active
          ? "page"
          : undefined
      }
    >
      <span
        className={styles.navCircle}
      >
        {icon}
      </span>

      <span
        className={styles.navLabel}
      >
        {label}
      </span>
    </button>
  );
}