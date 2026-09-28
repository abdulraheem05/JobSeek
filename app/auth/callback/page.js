"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    handled.current = true;

    async function handleCallback() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        /*
         * Supabase PKCE OAuth flow.
         */
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        /*
         * Check whether onboarding has already
         * been completed.
         */
        const {
          count,
          error: preferencesError,
        } = await supabase
          .from("user_preferences")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id);

        if (preferencesError) {
          console.error(
            "Preference check failed:",
            preferencesError
          );

          router.replace("/onboarding");
          return;
        }

        /*
         * Existing user → Home
         * New user → Onboarding
         */
        if (count > 0) {
          router.replace("/home");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error(
          "OAuth callback failed:",
          error
        );

        router.replace("/login?error=auth");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="authCallback">
      <div className="loadingDots" aria-label="Loading">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <style jsx>{`
        .authCallback {
          min-height: 100dvh;
          width: 100%;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #fdf9f2;
        }

        .loadingDots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .loadingDots span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #123760,
            #4d8ed8
          );
          animation: jump 0.9s infinite ease-in-out;
          box-shadow: 0 2px 8px rgba(18, 55, 96, 0.18);
        }

        .loadingDots span:nth-child(1) {
          animation-delay: 0s;
        }

        .loadingDots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loadingDots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes jump {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.55;
          }

          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loadingDots span {
            animation: none;
            opacity: 0.8;
          }
        }
      `}</style>
    </main>
  );
}