import type { SemesterSectionData } from "@/lib/workspace-data";
import { CourseAverageCard } from "./CourseAverageCard";
import { SemesterAverageCard } from "./SemesterAverageCard";

type SemesterSectionProps = {
  section: SemesterSectionData;
  reversed: boolean;
};

export function SemesterSection({
  section,
  reversed,
}: SemesterSectionProps) {
  return (
    <section
      aria-label={`Semester ${section.semester}`}
      className="grid gap-4 md:grid-cols-2 md:items-stretch"
    >
      <SemesterAverageCard
        semester={section}
        className={reversed ? "md:order-2" : ""}
      />

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          reversed ? "md:order-1" : ""
        }`}
      >
        {section.courses.map((course) => (
          <CourseAverageCard key={course.code} course={course} />
        ))}
      </div>
    </section>
  );
}
