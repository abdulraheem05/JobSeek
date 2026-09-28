"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  Bell,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

import AppHeader from "../components/AppHeader/AppHeader";
import DesktopMessage from "../components/DesktopMessage/DesktopMessage";
import JobCard from "../components/JobCard/JobCard";
import NotificationToggle from "../components/NotificationToggle/NotificationToggle";

import {
  CACHE_TTL,
  getHomeCache,
  isCacheFresh,
  setHomeCache,
} from "../../lib/cache/appCache";

/*
 * IMPORTANT:
 *
 * This must be the SAME matcher used by your
 * job-alert initialization system.
 *
 * It contains the keyword directory for:
 *
 * Software Engineering
 * Data & AI / ML
 * Cloud & DevOps
 * Cybersecurity
 * QA & Testing
 * UI/UX & Design
 * Digital & Graphics
 * Human Resource
 * Product, Project & Business
 */
import {
  getMatchingFields,
} from "../../lib/jobs/matcher";

import styles from "./home.module.css";

const NEW_WINDOW = 10 * 60 * 1000;

export default function HomePage() {
  const router = useRouter();

  const [alerts, setAlerts] = useState([]);
  const [preferences, setPreferences] =
    useState([]);

  const [firstName, setFirstName] =
    useState("there");

  const [search, setSearch] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  /*
   * Filters are now generated directly from
   * the user's selected preferences.
   */
  const filters = useMemo(
    () => ["All", ...preferences],
    [preferences]
  );

  const loadHome = useCallback(
    async () => {
      try {
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const cached =
          getHomeCache(user.id);

        if (cached) {
          setAlerts(
            cached.alerts || []
          );

          setPreferences(
            cached.preferences || []
          );

          setFirstName(
            cached.firstName || "there"
          );

          setLoading(false);

          if (
            isCacheFresh(
              cached,
              CACHE_TTL.home
            )
          ) {
            return;
          }

          refreshHomeData(user);
          return;
        }

        await refreshHomeData(user);
      } catch (error) {
        console.error(
          "Failed to load Home:",
          error
        );

        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  async function refreshHomeData(user) {
    const [
      {
        data: userData,
        error: userError,
      },
      {
        data: preferenceData,
        error: preferenceError,
      },
      {
        data: alertData,
        error: alertError,
      },
    ] = await Promise.all([
      /*
       * User
       */
      supabase
        .from("users")
        .select(
          "name, email, profile_image"
        )
        .eq("id", user.id)
        .single(),

      /*
       * Preferences
       */
      supabase
        .from("user_preferences")
        .select("field")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        }),

      /*
       * Alerts + Jobs
       */
      supabase
        .from("user_job_alerts")
        .select(`
          id,
          user_id,
          job_id,
          notified_at,
          seen_at,
          apply_clicked,
          share_count,
          saved,
          created_at,
          jobs (
            id,
            title,
            url,
            first_seen_at,
            last_seen_at,
            is_active,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (userError) {
      console.error(
        "Failed to load user:",
        userError
      );
    }

    if (preferenceError) {
      console.error(
        "Failed to load preferences:",
        preferenceError
      );
    }

    if (alertError) {
      console.error(
        "Failed to load alerts:",
        alertError
      );

      setLoading(false);
      return;
    }

    /*
     * Convert database preferences into
     * a simple array of field names.
     */
    const selectedFields =
      preferenceData?.map(
        (item) => item.field
      ) || [];

    /*
     * Determine user's display name.
     */
    const name =
      userData?.name ||
      userData?.email?.split("@")[0] ||
      "there";

    const displayFirstName =
      name.split(" ")[0] || "there";

    /*
     * Only keep alerts whose jobs still exist
     * and are active.
     */
    const validAlerts =
      (alertData || []).filter(
        (alert) =>
          alert.jobs &&
          alert.jobs.is_active !== false
      );

    /*
     * New jobs are identified by seen_at.
     */
    const unseenIds =
      validAlerts
        .filter(
          (alert) => !alert.seen_at
        )
        .map(
          (alert) => alert.id
        );

    let finalAlerts =
      validAlerts;

    if (unseenIds.length > 0) {
      const seenAt =
        new Date().toISOString();

      const {
        error: seenError,
      } = await supabase
        .from("user_job_alerts")
        .update({
          seen_at: seenAt,
        })
        .eq("user_id", user.id)
        .in(
          "id",
          unseenIds
        );

      if (seenError) {
        console.error(
          "Failed to mark jobs as seen:",
          seenError
        );
      } else {
        finalAlerts =
          validAlerts.map(
            (alert) =>
              unseenIds.includes(
                alert.id
              )
                ? {
                    ...alert,
                    seen_at:
                      seenAt,
                  }
                : alert
          );
      }
    }

    setAlerts(finalAlerts);
    setPreferences(selectedFields);
    setFirstName(displayFirstName);
    setLoading(false);

    setHomeCache(user.id, {
      alerts: finalAlerts,
      preferences:
        selectedFields,
      firstName:
        displayFirstName,
    });
  }

  /*
   * =========================================================
   * FILTER JOBS
   * =========================================================
   *
   * IMPORTANT:
   *
   * We DO NOT check:
   *
   * title.includes("Data & AI / ML")
   *
   * anymore.
   *
   * Instead, the title is passed through the same
   * keyword matcher used throughout JobSeek.
   *
   * Example:
   *
   * "Machine Learning Engineer"
   *
   * -> Data & AI / ML
   *
   * "React Frontend Engineer"
   *
   * -> Software Engineering
   *
   * "Cloud DevOps Engineer"
   *
   * -> Cloud & DevOps
   *
   * Therefore the Home filter stays synchronized
   * with the actual job matching system.
   */
  const filteredAlerts =
    useMemo(() => {
      let result = alerts;

      /*
       * FIELD FILTER
       */
      if (
        selectedFilter !== "All"
      ) {
        result = result.filter(
          (alert) => {
            const title =
              alert.jobs?.title || "";

            /*
             * Run the SAME matcher used
             * by the alert system.
             */
            const matchingFields =
              getMatchingFields(title);

            return matchingFields.includes(
              selectedFilter
            );
          }
        );
      }

      /*
       * SEARCH
       *
       * Search continues to work across:
       *
       * - Job title
       * - Company name
       */
      if (search.trim()) {
        const query =
          search
            .trim()
            .toLowerCase();

        result = result.filter(
          (alert) => {
            const title =
              alert.jobs?.title
                ?.toLowerCase() ||
              "";

            const company =
              alert.jobs?.companies?.name
                ?.toLowerCase() ||
              "";

            return (
              title.includes(query) ||
              company.includes(query)
            );
          }
        );
      }

      return result;
    }, [
      alerts,
      selectedFilter,
      search,
    ]);

  /*
   * =========================================================
   * NEW JOB
   * =========================================================
   */
  function isNewJob(alert) {
    if (!alert.seen_at) {
      return true;
    }

    const seenAt =
      new Date(
        alert.seen_at
      ).getTime();

    return (
      Date.now() - seenAt <
      NEW_WINDOW
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.app}>
        <AppHeader />

        {/* =====================================================
            DISCOVERY HEADER
        ===================================================== */}

        <section
          className={
            styles.discoveryHeader
          }
        >
          <h1>
            Be the first to be
            notified when{" "}

            {preferences.length ===
            1
              ? "an "
              : ""}

            <PreferenceText
              preferences={
                preferences
              }
            />{" "}

            {preferences.length ===
            1
              ? "opening is"
              : "openings are"}{" "}

            posted.
          </h1>

          <NotificationToggle />
        </section>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section
          className={
            styles.searchSection
          }
        >
          <div
            className={
              styles.searchBar
            }
          >
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search jobs or companies"
              aria-label="Search jobs or companies"
            />
          </div>
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section
          className={
            styles.filtersSection
          }
        >
          <div
            className={
              styles.filterHeader
            }
          >
            <span>
              Filter by field
            </span>

            <span
              className={
                styles.resultCount
              }
            >
              {
                filteredAlerts.length
              }{" "}
              {
                filteredAlerts.length ===
                1
                  ? "opening"
                  : "openings"
              }
            </span>
          </div>

          <div
            className={
              styles.filterRow
            }
          >
            {filters.map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`
                    ${styles.filterChip}
                    ${
                      selectedFilter ===
                      filter
                        ? styles.filterChipActive
                        : ""
                    }
                  `}
                  onClick={() =>
                    setSelectedFilter(
                      filter
                    )
                  }
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </section>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        <section
          className={
            styles.alertSection
          }
        >
          <div
            className={
              styles.sectionTitleRow
            }
          >
            <div>
              <h2>
                Latest alerts
              </h2>
            </div>

            {selectedFilter !==
              "All" ||
            search ? (
              <button
                type="button"
                className={
                  styles.clearFilter
                }
                onClick={() => {
                  setSelectedFilter(
                    "All"
                  );

                  setSearch("");
                }}
              >
                Clear
              </button>
            ) : null}
          </div>

          {loading ? (
            <SkeletonList />
          ) : filteredAlerts.length ===
            0 ? (
            <EmptyState
              hasSearch={
                Boolean(
                  search.trim()
                ) ||
                selectedFilter !==
                  "All"
              }
            />
          ) : (
            <div
              className={
                styles.jobs
              }
            >
              {filteredAlerts.map(
                (alert) => (
                  <JobCard
                    key={alert.id}
                    alert={alert}
                    isNew={isNewJob(
                      alert
                    )}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      <div
        className={
          styles.desktopMessage
        }
      >
        <DesktopMessage />
      </div>
    </main>
  );
}


/* =========================================================
   PREFERENCE TEXT
========================================================= */

function PreferenceText({
  preferences,
}) {
  if (
    !preferences ||
    preferences.length ===
      0
  ) {
    return "relevant";
  }

  if (
    preferences.length ===
    1
  ) {
    return (
      <span
        className={
          styles.preferenceText
        }
      >
        {preferences[0]}
      </span>
    );
  }

  if (
    preferences.length ===
    2
  ) {
    return (
      <>
        <span
          className={
            styles.preferenceText
          }
        >
          {preferences[0]}
        </span>{" "}
        or{" "}
        <span
          className={
            styles.preferenceText
          }
        >
          {preferences[1]}
        </span>
      </>
    );
  }

  return (
    <>
      {preferences
        .slice(0, -1)
        .map(
          (
            field,
            index
          ) => (
            <span key={field}>
              <span
                className={
                  styles.preferenceText
                }
              >
                {field}
              </span>

              {index <
              preferences.length -
                2
                ? ", "
                : " "}
            </span>
          )
        )}

      or{" "}
      <span
        className={
          styles.preferenceText
        }
      >
        {
          preferences[
            preferences.length -
              1
          ]
        }
      </span>
    </>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasSearch,
}) {
  return (
    <div
      className={
        styles.emptyState
      }
    >
      <div
        className={
          styles.emptyIcon
        }
      >
        <Bell size={25} />
      </div>

      <h3>
        {hasSearch
          ? "No matching openings"
          : "No new openings yet"}
      </h3>

      <p>
        {hasSearch
          ? "Try a different search or remove the current filter."
          : "We'll show relevant opportunities here as soon as they're posted."}
      </p>
    </div>
  );
}


/* =========================================================
   SKELETON
========================================================= */

function SkeletonList() {
  return (
    <div
      className={
        styles.jobs
      }
    >
      {Array.from({
        length: 4,
      }).map(
        (_, index) => (
          <div
            key={index}
            className={
              styles.skeletonCard
            }
          >
            <div
              className={
                styles.skeletonMain
              }
            >
              <div
                className={
                  styles.skeletonContent
                }
              >
                <div
                  className={
                    styles.skeletonSmall
                  }
                />

                <div
                  className={
                    styles.skeletonTitle
                  }
                />

                <div
                  className={
                    styles.skeletonCompany
                  }
                />
              </div>

              <div
                className={
                  styles.skeletonLogo
                }
              />
            </div>

            <div
              className={
                styles.skeletonDivider
              }
            />

            <div
              className={
                styles.skeletonFooter
              }
            >
              <div />
              <div />
            </div>
          </div>
        )
      )}
    </div>
  );
}