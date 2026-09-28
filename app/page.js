"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import "./loading.css";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function routeUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      const {
        count,
        error,
      } = await supabase
        .from("user_preferences")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        console.error(
          "Failed to check onboarding:",
          error
        );

        router.replace("/onboarding");
        return;
      }

      router.replace(
        count > 0
          ? "/home"
          : "/onboarding"
      );
    }

    routeUser();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="loadingPage">
      <div className="loadingDots" aria-label="Loading">
        <span className="loadingDot" />
        <span className="loadingDot" />
        <span className="loadingDot" />
      </div>
    </main>
  );
}