import {
  buildSemesterSections,
  mockCourseAverages,
  mockSemesterAverages,
} from "@/lib/workspace-data";
import { SemesterSection } from "./_components/SemesterSection";

export default function WorkspacePage() {
  const sections = buildSemesterSections(
    mockSemesterAverages,
    mockCourseAverages,
  );

  return (
    <>
      <div className="mb-10">
        <h1 className="font-matcha text-4xl leading-tight text-black sm:text-5xl">
          Overview
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-base">
          Your grades and averages by semester.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {sections.map((section, index) => (
          <SemesterSection
            key={section.semester}
            section={section}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </>
  );
}
