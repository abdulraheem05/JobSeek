"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import DesktopMessage from "../components/DesktopMessage/DesktopMessage";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.loading}>
        <div className={styles.loadingDot} />
      </div>
    </main>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (user) {
        router.replace("/");
      } else {
        setChecking(false);
      }
    }

    if (searchParams.get("error") === "auth") {
      setError(
        "Google sign-in could not be completed. Please try again."
      );
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error(error);

      setError(
        "Unable to continue with Google. Please try again."
      );

      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingDot} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>

      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <DesktopMessage />
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>

        <div className={styles.glow} />
        <div className={styles.glowSecondary} />

        <div className={styles.content}>

          <img
            src="/JobSeek with Tagline.png"
            alt="JobSeek"
            className={styles.logo}
          />

          <div className={styles.loginSection}>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />

              <span>
                {loading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>
            </button>

            {error && (
              <p className={styles.error}>
                {error}
              </p>
            )}

            <p className={styles.terms}>
              By continuing, you agree to JobSeek&apos;s
              terms and privacy policy.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.26v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.51 13.82A5.86 5.86 0 0 1 6.2 12c0-.63.11-1.25.31-1.82V7.65H3.26A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.01 4.35l3.25-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.74 5.4l3.25 2.53c1.01-2.33 3.17-4.05 5.72-4.05Z"
      />
    </svg>
  );
}