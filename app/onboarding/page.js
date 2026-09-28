"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

import {
  clearUserCaches,
} from "../../lib/cache/appCache";

import styles from "./onboarding.module.css";

const fields = [
  "Software Engineering",
  "Data & AI / ML",
  "Cloud & DevOps",
  "Cybersecurity",
  "QA & Testing",
  "UI/UX & Design",
  "Marketing & Graphics",
  "Human Resource",
  "Product, Project & Business",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [editing, setEditing] =
    useState(false);

  const [selectedFields, setSelectedFields] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      /*
       * Read ?edit=true without useSearchParams().
       * This keeps the page compatible with Next.js
       * production prerendering.
       */
      const params = new URLSearchParams(
        window.location.search
      );

      const isEditing =
        params.get("edit") === "true";

      setEditing(isEditing);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("user_preferences")
        .select("field")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (!active) return;

      if (error) {
        setError(
          "Unable to load your preferences."
        );

        setLoading(false);
        return;
      }

      const existing =
        (data || []).map(
          (item) => item.field
        );

      /*
       * Normal onboarding should never be shown
       * to a user who already completed it.
       */
      if (
        existing.length > 0 &&
        !isEditing
      ) {
        router.replace("/home");
        return;
      }

      setSelectedFields(existing);
      setLoading(false);
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, [router]);

  function toggleField(field) {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter(
            (item) => item !== field
          )
        : [...current, field]
    );
  }

  async function handleDone() {
    if (selectedFields.length === 0) {
      setError(
        "Please select at least one field."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      /*
       * Replace the user's preference set.
       */
      const {
        error: deleteError,
      } = await supabase
        .from("user_preferences")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      const {
        error: insertError,
      } = await supabase
        .from("user_preferences")
        .insert(
          selectedFields.map((field) => ({
            user_id: user.id,
            field,
          }))
        );

      if (insertError) {
        throw insertError;
      }

      /*
       * Initialize all currently active jobs
       * matching the new preferences.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your session expired. Please sign in again."
        );
      }

      const response = await fetch(
        "/api/initialize-alerts",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const body =
          await response.json().catch(
            () => ({})
          );

        throw new Error(
          body.error ||
            "Could not initialize your alerts."
        );
      }

      /*
       * Preferences have changed.
       *
       * The old Home/Saved/Profile cache is no
       * longer valid, so clear it before returning
       * to Home.
       *
       * Career cache stays because preferences
       * have nothing to do with company data.
       */
      clearUserCaches();

      router.replace("/home");

    } catch (err) {
      console.error(
        "Saving preferences failed:",
        err
      );

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.loadingPage}>
      <div className={styles.loader} aria-label="Loading">
      </div>
    </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>

        <div className={styles.progress}>
          <span
            className={
              styles.progressActive
            }
          />

          <span />
        </div>

        <div className={styles.heading}>
          <p className={styles.eyebrow}>
            {editing
              ? "UPDATE JOBSEEK"
              : "PERSONALIZE JOBSEEK"}
          </p>

          <h1>
            {editing ? (
              <>
                Update your
                <br />
                job fields.
              </>
            ) : (
              <>
                What fields are
                <br />
                you looking for?
              </>
            )}
          </h1>

          <p className={styles.description}>
            Select all the areas you&apos;re
            interested in. We&apos;ll use these
            to find relevant opportunities for you.
          </p>
        </div>

        <div className={styles.fieldGrid}>
          {fields.map((field) => {
            const selected =
              selectedFields.includes(field);

            return (
              <button
                key={field}
                type="button"
                className={`${styles.fieldButton} ${
                  selected
                    ? styles.selected
                    : ""
                }`}
                onClick={() =>
                  toggleField(field)
                }
              >
                <span>{field}</span>

                <span
                  className={`${styles.checkmark} ${
                    selected
                      ? styles.checkmarkSelected
                      : ""
                  }`}
                  aria-hidden="true"
                >
                  {selected && (
                    <span className={styles.checkIcon} />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <button
          type="button"
          className={styles.doneButton}
          onClick={handleDone}
          disabled={saving}
        >
          {saving
            ? "Personalizing..."
            : "Done"}
        </button>

        <p className={styles.bottomText}>
          You can change your preferences anytime
          from your profile.
        </p>

      </section>
    </main>
  );
}