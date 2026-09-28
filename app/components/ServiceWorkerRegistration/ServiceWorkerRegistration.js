"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "JobSeek service worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "JobSeek service worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}