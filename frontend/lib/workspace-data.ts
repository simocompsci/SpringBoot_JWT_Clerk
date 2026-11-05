export type CourseAverage = {
  code: string;
  name: string;
  average: number;
  semester: number;
};

export type SemesterAverage = {
  semester: number;
  average: number;
};

export type SemesterSectionData = SemesterAverage & {
  courses: CourseAverage[];
};

export const mockSemesterAverages: SemesterAverage[] = [
  { semester: 1, average: 16.11 },
  { semester: 2, average: 17.23 },
  { semester: 3, average: 17.75 },
];

export const mockCourseAverages: CourseAverage[] = [
  { code: "MATH101", name: "Advanced Mathematics I", average: 16.8, semester: 1 },
  { code: "CS101", name: "Introduction to Programming", average: 18.4, semester: 1 },
  { code: "PHY101", name: "Physics I", average: 14.75, semester: 1 },
  { code: "ENG101", name: "Academic English", average: 15.6, semester: 1 },
  { code: "STAT101", name: "Probability and Statistics", average: 17.2, semester: 1 },
  { code: "CS102", name: "Computer Architecture", average: 13.9, semester: 1 },

  { code: "MATH102", name: "Advanced Mathematics II", average: 17.1, semester: 2 },
  { code: "CS201", name: "Data Structures and Algorithms", average: 18.75, semester: 2 },
  { code: "CS202", name: "Object-Oriented Programming", average: 17.9, semester: 2 },
  { code: "PHY102", name: "Physics II", average: 15.4, semester: 2 },
  { code: "ENG102", name: "Technical Writing", average: 16.2, semester: 2 },
  { code: "STAT201", name: "Applied Statistics", average: 18.0, semester: 2 },

  { code: "CS301", name: "Database Systems", average: 18.6, semester: 3 },
  { code: "CS302", name: "Operating Systems", average: 17.4, semester: 3 },
  { code: "CS303", name: "Computer Networks", average: 16.9, semester: 3 },
  { code: "MATH301", name: "Linear Algebra", average: 18.1, semester: 3 },
  { code: "CS304", name: "Web Development", average: 19.0, semester: 3 },
  { code: "ENG201", name: "Communication Skills", average: 16.5, semester: 3 },
];

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
