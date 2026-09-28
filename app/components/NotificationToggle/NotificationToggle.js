"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
} from "lucide-react";

import styles from "./NotificationToggle.module.css";

import { supabase } from "../../../../lib/supabase";

export default function NotificationToggle() {
  const [
    enabled,
    setEnabled,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    supported,
    setSupported,
  ] = useState(true);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    try {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setSupported(false);
        setLoading(false);
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      setEnabled(
        Boolean(subscription)
      );
    } catch (error) {
      console.error(
        "Notification support check failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function enableNotifications() {
    if (loading) return;

    try {
      setLoading(true);

      if (!supported) {
        throw new Error(
          "Notifications are not supported on this device."
        );
      }

      console.log(
        "1. Requesting notification permission..."
      );

      const permission =
        await Notification.requestPermission();

      console.log(
        "Permission:",
        permission
      );

      if (permission !== "granted") {
        setEnabled(false);
        return;
      }

      console.log(
        "2. Getting service worker..."
      );

      const registration =
        await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      console.log(
        "Existing subscription:",
        Boolean(subscription)
      );

      if (!subscription) {
        const publicKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error(
            "VAPID public key is missing."
          );
        }

        console.log(
          "3. Creating push subscription..."
        );

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(
                publicKey
              ),
          });

        console.log(
          "Push subscription created."
        );
      }

      // --------------------------------
      // GET CURRENT SUPABASE SESSION
      // --------------------------------

      console.log(
        "4. Getting Supabase session..."
      );

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Could not get login session: ${sessionError.message}`
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "No authentication token found. Please log in again."
        );
      }

      console.log(
        "Authentication token found:",
        Boolean(session.access_token)
      );

      // --------------------------------
      // SAVE SUBSCRIPTION
      // --------------------------------

      console.log(
        "5. Saving push subscription..."
      );

      const response =
        await fetch(
          "/api/notifications/subscribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              subscription:
                subscription.toJSON(),
            }),
          }
        );

      console.log(
        "Subscribe API status:",
        response.status
      );

      const result =
        await response.json();

      console.log(
        "Subscribe API response:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Failed to enable notifications."
        );
      }

      console.log(
        "6. Notifications enabled successfully."
      );

      setEnabled(true);

    } catch (error) {
      console.error(
        "Failed to enable notifications:",
        error
      );

      alert(
        error?.message ||
          "Could not enable notifications. Please try again."
      );

      setEnabled(false);

    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    if (loading) return;

    try {
      setLoading(true);

      const registration =
        await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        setEnabled(false);
        return;
      }

      // --------------------------------
      // GET CURRENT SUPABASE SESSION
      // --------------------------------

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        throw new Error(
          "Your JobSeek session could not be verified. Please log in again."
        );
      }

      // --------------------------------
      // REMOVE FROM DATABASE
      // --------------------------------

      const response =
        await fetch(
          "/api/notifications/unsubscribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              endpoint:
                subscription.endpoint,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Failed to disable notifications."
        );
      }

      // --------------------------------
      // REMOVE BROWSER SUBSCRIPTION
      // --------------------------------

      await subscription.unsubscribe();

      setEnabled(false);

    } catch (error) {
      console.error(
        "Failed to disable notifications:",
        error
      );

      alert(
        error?.message ||
          "Could not disable notifications. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return null;
  }

  return (
    <div
      className={
        styles.notificationCard
      }
    >
      <div
        className={
          styles.iconWrapper
        }
      >
        <Bell size={18} />
      </div>

      <div className={styles.text}>
        <p className={styles.title}>
          Job notifications
        </p>

        <p
          className={
            styles.description
          }
        >
          Get notified when a matching
          job is posted.
        </p>
      </div>

      <button
        type="button"
        className={`${styles.toggle} ${
          enabled ? styles.toggleOn : ""
        } ${loading ? styles.toggleLoading : ""}`}
        onClick={
          enabled
            ? disableNotifications
            : enableNotifications
        }
        disabled={loading}
        aria-label={
          loading
            ? "Updating notifications"
            : enabled
            ? "Disable notifications"
            : "Enable notifications"
        }
      >
        {loading ? (
          <span className={styles.spinner}>
            <span />
            <span />
            <span />
          </span>
        ) : (
          <span className={styles.toggleKnob} />
        )}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(
  base64String
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) =>
        char.charCodeAt(0)
    )
  );
}