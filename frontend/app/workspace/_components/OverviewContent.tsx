"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { SemesterSectionData } from "@/lib/types";
import { buildSemesterSections } from "@/lib/workspace";
import { getCoursesAverage, getSemesterAverage } from "@/services/Stats";
import { SemesterSection } from "./SemesterSection";
import { StatusMessage } from "./StatusMessage";

type OverviewStatus = "loading" | "error" | "ready";

export function OverviewContent() {
  const { getToken } = useAuth();
  const [sections, setSections] = useState<SemesterSectionData[]>([]);
  const [status, setStatus] = useState<OverviewStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setStatus("loading");

      try {
        const [semesterAverages, courseAverages] = await Promise.all([
          getSemesterAverage(getToken),
          getCoursesAverage(getToken),
        ]);

        if (!cancelled) {
          setSections(buildSemesterSections(semesterAverages, courseAverages));
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [getToken, reloadKey]);

  if (status === "loading") {
    return <OverviewSkeleton />;
  }

  if (status === "error") {
    return (
      <StatusMessage
        title="We couldn't load your overview"
        description="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  if (sections.length === 0) {
    return (
      <StatusMessage
        title="No averages yet"
        description="Your semester and course averages will appear here once grades are available."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {sections.map((section, index) => (
        <SemesterSection
          key={section.semester}
          section={section}
          reversed={index % 2 === 1}
        />
      ))}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      {[0, 1].map((section) => (
        <div key={section} className="grid gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse border border-neutral-200 bg-neutral-50" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse border border-neutral-200 bg-neutral-100"
              />
            ))}
          </div>
        </div>
      ))}

      <span className="sr-only">Loading overview</span>
    </div>
  );
}
