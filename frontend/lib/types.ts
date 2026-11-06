export interface CourseAverage {
  code: string;
  name: string;
  semester: number;
  average: number;
}

export interface GradeResponse {
  code: string;
  name: string;
  credits: number;
  examType: ExamType;
  score: number;
  letterGrade: string;
  coefficient: number;
  semester: number;
}

export interface SemesterAverage {
  semester: number;
  average: number;
}

export type ExamType = "EXAM" | "MIDTERM" | "FINAL" | "ASSIGNMENT" | "PROJECT" | "QUIZ" ;
