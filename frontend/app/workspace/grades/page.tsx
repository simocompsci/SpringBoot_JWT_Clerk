import { mockGrades } from "@/lib/grades-data";
import { GradesTable } from "../_components/GradesTable";

export default function GradesPage() {
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

      <GradesTable rows={mockGrades} />
    </>
  );
}
