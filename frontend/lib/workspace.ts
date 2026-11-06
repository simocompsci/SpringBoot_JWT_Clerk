import type {
  CourseAverage,
  SemesterAverage,
  SemesterSectionData,
} from "@/lib/types";

export function buildSemesterSections(
  semesters: SemesterAverage[],
  courses: CourseAverage[],
): SemesterSectionData[] {
  return semesters
    .map((semester) => ({
      ...semester,
      courses: courses
        .filter((course) => course.semester === semester.semester)
        .sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort((a, b) => a.semester - b.semester);
}

export function formatAverage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
