"use client";

import { GradesTable } from "../_components/GradesTable";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { GradeResponse } from "@/lib/types";
import { getStudentGrades } from "@/services/Grades";

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeResponse[] | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchStudentGrades() {
      const response = await getStudentGrades(getToken);
      setGrades(response);
      console.log(grades);
    }

    fetchStudentGrades();
  }, [getToken]);

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

      <GradesTable rows={grades} />
    </>
  );
}
