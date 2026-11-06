export type ExamType =
  | "EXAM"
  | "MIDTERM"
  | "FINAL"
  | "ASSIGNMENT"
  | "PROJECT"
  | "QUIZ";

export interface CourseAverage {
  code: string;
  name: string;
  semester: number;
  average: number;
}

export interface SemesterAverage {
  semester: number;
  average: number;
}

export interface SemesterSectionData extends SemesterAverage {
  courses: CourseAverage[];
}

export interface GradeResponse {
  code: string;
  name: string;
  credits: number;
  examType: ExamType;
  score: number;
  letterGrade: string | null;
  coefficient: number;
  semester: number;
}
