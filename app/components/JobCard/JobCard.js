"use client";

import { useState } from "react";

import {
  Bookmark,
  Share2,
  Globe2,
  ArrowUpRight,
} from "lucide-react";

import { supabase } from "../../../../lib/supabase";

import {
  getCompanyInitials,
  getRelativeTime,
  getCompanyWebsite,
} from "../../../lib/jobs/helpers/jobs";

import { updateSavedState } from "../../../lib/cache/appCache";

import styles from "./JobCard.module.css";

export default function JobCard({
  alert,
  onSavedChange,
  isNew = false,
}) {
  const job = alert?.jobs;
  const company = job?.companies;

  const [saved, setSaved] = useState(
    Boolean(alert?.saved)
  );

  const [busy, setBusy] = useState(false);

  if (!job) {
    return null;
  }

  const companyName =
    company?.name || "Unknown company";

  const logoUrl =
    company?.logo_url || null;

  const relativeTime = getRelativeTime(
    job.first_seen_at
  );

  async function handleSave() {
    if (busy) return;

    const nextSaved = !saved;

    setSaved(nextSaved);
    setBusy(true);

    const { error } = await supabase
      .from("user_job_alerts")
      .update({
        saved: nextSaved,
      })
      .eq("id", alert.id);

    setBusy(false);

    if (error) {
      console.error(
        "Failed to update saved state:",
        error
      );

      setSaved(!nextSaved);
      return;
    }

    updateSavedState(
      alert,
      nextSaved
    );

    onSavedChange?.(
      alert.id,
      nextSaved
    );
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${companyName}`,
          url: job.url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          job.url
        );
      }

      const current = Number(
        alert.share_count || 0
      );

      await supabase
        .from("user_job_alerts")
        .update({
          share_count: current + 1,
        })
        .eq("id", alert.id);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Share failed:",
          error
        );
      }
    }
  }

  async function handleApply() {
    const { error } = await supabase
      .from("user_job_alerts")
      .update({
        apply_clicked: true,
      })
      .eq("id", alert.id);

    if (error) {
      console.error(
        "Failed to record apply:",
        error
      );
    }

    window.open(
      job.url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleWebsite() {
    const website =
      getCompanyWebsite(companyName);

    if (!website) return;

    window.open(
      website,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <article
      className={`${styles.jobCard} ${
        isNew ? styles.jobCardNew : ""
      }`}
    >
      <div className={styles.jobMain}>
        <div className={styles.jobContent}>
          <div className={styles.jobMetaTop}>
            {isNew && (
              <span className={styles.newBadge}>
                New
              </span>
            )}

            <span className={styles.jobTime}>
              {relativeTime}
            </span>
          </div>

          <h3
            className={styles.jobTitle}
            title={job.title}
          >
            {job.title}
          </h3>

          <p className={styles.companyName}>
            {companyName}
          </p>
        </div>

        <div className={styles.companyLogo}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${companyName} logo`}
              className={styles.companyLogoImage}
            />
          ) : (
            getCompanyInitials(companyName)
          )}
        </div>
      </div>

      <div className={styles.cardDivider} />

      <div className={styles.jobActions}>
        <div className={styles.secondaryActions}>
          <button
            type="button"
            className={styles.textAction}
            onClick={handleShare}
            aria-label={`Share ${job.title}`}
          >
            <Share2 size={17} />

            <span>Share</span>
          </button>

          <button
            type="button"
            className={`${styles.textAction} ${
              saved
                ? styles.textActionActive
                : ""
            }`}
            onClick={handleSave}
            disabled={busy}
            aria-label={
              saved
                ? "Remove from saved"
                : "Save job"
            }
          >
            <Bookmark
              size={17}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {saved ? "Saved" : "Save"}
            </span>
          </button>

          <button
            type="button"
            className={styles.iconAction}
            onClick={handleWebsite}
            aria-label={`Visit ${companyName} website`}
          >
            <Globe2 size={17} />
          </button>
        </div>

        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
        >
          <span>Apply</span>

          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}