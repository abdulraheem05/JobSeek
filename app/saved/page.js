"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

import { supabase } from "../../../lib/supabase";

import JobCard from "../components/JobCard/JobCard";
import DesktopMessage from "../components/DesktopMessage/DesktopMessage";
import AppHeader from "../components/AppHeader/AppHeader";

import {
  CACHE_TTL,
  getSavedCache,
  isCacheFresh,
  setSavedCache,
} from "../../lib/cache/appCache";

import styles from "./saved.module.css";

export default function SavedPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSavedJobs() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const cached = getSavedCache(user.id);

        if (cached) {
          setSavedJobs(cached.savedJobs || []);
          setLoading(false);

          // Only refresh in the background when cache is stale.
          if (!isCacheFresh(cached, CACHE_TTL.saved)) {
            refreshSavedJobs(user.id);
          }

          return;
        }

        await refreshSavedJobs(user.id);
      } catch (error) {
        console.error(
          "Unexpected saved jobs error:",
          error
        );

        if (active) {
          setSavedJobs([]);
          setLoading(false);
        }
      }
    }

    async function refreshSavedJobs(userId) {
      try {
        const { data, error } = await supabase
          .from("user_job_alerts")
          .select(`
            id,
            saved,
            apply_clicked,
            share_count,
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
          .eq("user_id", userId)
          .eq("saved", true)
          .order("created_at", {
            ascending: false,
          });

        if (!active) return;

        if (error) {
          console.error(
            "Failed to load saved jobs:",
            error
          );

          if (!getSavedCache(userId)) {
            setSavedJobs([]);
          }

          setLoading(false);
          return;
        }

        const validSavedJobs = (data || []).filter(
          (alert) => alert.jobs
        );

        setSavedJobs(validSavedJobs);

        setSavedCache(userId, validSavedJobs);
      } catch (error) {
        console.error(
          "Unexpected saved jobs refresh error:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <AppHeader />

      <div className={styles.app}>
        <section className={styles.content}>
          <header className={styles.header}>
          
            <h1>Saved jobs</h1>

            <p className={styles.description}>
              Keep the opportunities you want
              to come back to.
            </p>
          </header>

          {loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : savedJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Bookmark size={23} />
              </div>

              <h2>No saved jobs</h2>

              <p>
                Save jobs you're interested in
                and they'll appear here.
              </p>
            </div>
          ) : (
            <div className={styles.jobs}>
              {savedJobs.map((alert) => (
                <JobCard
                  key={alert.id}
                  alert={alert}
                  onSavedChange={(id, saved) => {
                    if (!saved) {
                      setSavedJobs((current) =>
                        current.filter(
                          (item) =>
                            item.id !== id
                        )
                      );
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <DesktopMessage />
    </main>
  );
}