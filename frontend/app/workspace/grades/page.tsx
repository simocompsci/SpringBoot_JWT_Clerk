"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { GradeResponse } from "@/lib/types";
import { getStudentGrades } from "@/services/Grades";
import { GradesTable } from "../_components/GradesTable";
import { StatusMessage } from "../_components/StatusMessage";

type GradesStatus = "loading" | "error" | "ready";

export default function GradesPage() {
  const { getToken } = useAuth();
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [status, setStatus] = useState<GradesStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadGrades() {
      setStatus("loading");

      try {
        const response = await getStudentGrades(getToken);

        if (!cancelled) {
          setGrades(response);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadGrades();

    return () => {
      cancelled = true;
    };
  }, [getToken, reloadKey]);

  return (
    <>
      <div className="mb-10">
        <h1 className="font-matcha text-4xl leading-tight text-black sm:text-5xl">
          Grades
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-base">
          All recorded grades across your semesters.
        </p>
      </div>

      {status === "loading" ? (
        <GradesSkeleton />
      ) : status === "error" ? (
        <StatusMessage
          title="We couldn't load your grades"
          description="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      ) : (
        <GradesTable rows={grades} />
      )}
    </>
  );
}

function GradesSkeleton() {
  return (
    <div
      className="border border-neutral-200 bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-3 sm:px-5">
        <div className="h-3 w-40 animate-pulse bg-neutral-200" />
      </div>

      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-6 border-b border-neutral-200 px-3 py-4 last:border-b-0 sm:px-5"
        >
          <div className="h-3 w-14 animate-pulse bg-neutral-100" />
          <div className="h-3 w-48 animate-pulse bg-neutral-100" />
          <div className="ml-auto h-3 w-16 animate-pulse bg-neutral-100" />
        </div>
      ))}

      <span className="sr-only">Loading grades</span>
    </div>
  );
}
