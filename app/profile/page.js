"use client";

import { useEffect, useState } from "react";
import {
  Settings2,
  LogOut,
  Pencil,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

import {
  CACHE_TTL,
  getProfileCache,
  isCacheFresh,
  setProfileCache,
  clearAllCaches,
} from "../../lib/cache/appCache";

import DesktopMessage from "../components/DesktopMessage/DesktopMessage";

import AppHeader from "../components/AppHeader/AppHeader";

import styles from "./profile.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !authUser) {
          setUser(null);
          setPreferences([]);
          setLoading(false);
          return;
        }

        const cached = getProfileCache(
          authUser.id
        );

        /*
         * CACHE-FIRST
         */
        if (cached) {
          setUser(cached.user || null);
          setPreferences(
            cached.preferences || []
          );
          setLoading(false);

          /*
           * Only refresh if stale.
           */
          if (
            !isCacheFresh(
              cached,
              CACHE_TTL.profile
            )
          ) {
            refreshProfile(authUser.id);
          }

          return;
        }

        /*
         * No cache.
         */
        await refreshProfile(authUser.id);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        if (!cancelled) {
          setUser(null);
          setPreferences([]);
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshProfile(userId) {
    try {
      const [userResult, preferencesResult] =
        await Promise.all([
          supabase
            .from("users")
            .select(
              "id, name, email, profile_image"
            )
            .eq("id", userId)
            .single(),

          supabase
            .from("user_preferences")
            .select("field")
            .eq("user_id", userId)
            .order("created_at", {
              ascending: true,
            }),
        ]);

      let profileUser = null;
      let selectedPreferences = [];

      /*
       * User
       */
      if (userResult.error) {
        console.error(
          "Failed to load profile:",
          userResult.error
        );
      } else {
        profileUser = userResult.data || null;
        setUser(profileUser);
      }

      /*
       * Preferences
       */
      if (preferencesResult.error) {
        console.error(
          "Failed to load preferences:",
          preferencesResult.error
        );
      } else {
        selectedPreferences =
          (preferencesResult.data || []).map(
            (item) => item.field
          );

        setPreferences(
          selectedPreferences
        );
      }

      /*
       * Cache both pieces together.
       */
      setProfileCache(userId, {
        user: profileUser,
        preferences: selectedPreferences,
      });
    } catch (error) {
      console.error(
        "Unexpected error refreshing profile:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      /*
       * Clear every user-specific cache BEFORE
       * leaving the account.
       *
       * Career cache intentionally remains available
       * because it is global and not user-specific.
       */
      clearAllCaches();

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Failed to sign out:",
          error
        );

        setSigningOut(false);
        return;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Unexpected sign out error:",
        error
      );

      setSigningOut(false);
    }
  }

  const displayName =
    user?.name?.trim() ||
    "JobSeek User";

  const email =
    user?.email ||
    "";

  const initials =
    getInitials(displayName);

  return (
    <main className={styles.page}>
      <AppHeader/>
      <div className={styles.app}>
        <section className={styles.content}>
          <header className={styles.simpleHeader}>
            <p className={styles.kicker}>
              YOUR ACCOUNT
            </p>

            <h1>Profile</h1>
          </header>

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <section className={styles.profilePanel}>
                <div className={styles.profileAvatar}>
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={`${displayName} profile`}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className={styles.profileInfo}>
                  <strong>
                    {displayName}
                  </strong>

                  {email && (
                    <span>{email}</span>
                  )}

                  <span>
                    Personalized job discovery
                  </span>
                </div>
              </section>

              <section
                className={
                  styles.preferencePanel
                }
              >
                <div className={styles.preferenceHeading}>
                  <div>
                    <span className={styles.panelLabel}>
                      YOUR INTERESTS
                    </span>

                    <h3>Job fields</h3>
                  </div>

                  <button
                    type="button"
                    className={styles.editButton}
                    aria-label="Edit profile"
                    onClick={() =>
                      window.location.href =
                        "/onboarding?edit=true"
                    }
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                <div
                  className={
                    styles.preferenceList
                  }
                >
                  {preferences.length > 0 ? (
                    preferences.map(
                      (field) => (
                        <span
                          key={field}
                          className={
                            styles.preferenceTag
                          }
                        >
                          {field}
                        </span>
                      )
                    )
                  ) : (
                    <span
                      className={
                        styles.noPreferences
                      }
                    >
                      No preferences selected
                    </span>
                  )}
                </div>
              </section>

              <button
                type="button"
                className={
                  styles.signOutButton
                }
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={18} />

                {signingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            </>
          )}
        </section>

      </div>

      <DesktopMessage />
    </main>
  );
}

/* =========================================================
   LOADING
========================================================= */

function ProfileSkeleton() {
  return (
    <div className={styles.profileSkeleton}>
      <div
        className={
          styles.profileSkeletonCard
        }
      >
        <div
          className={
            styles.profileSkeletonAvatar
          }
        />

        <div
          className={
            styles.profileSkeletonText
          }
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      <div
        className={
          styles.profileSkeletonPanel
        }
      >
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name) return "JS";

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}