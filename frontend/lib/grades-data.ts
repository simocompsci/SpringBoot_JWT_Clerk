export type ExamType =
  | "EXAM"
  | "MIDTERM"
  | "FINAL"
  | "ASSIGNMENT"
  | "PROJECT"
  | "QUIZ";

export type GradeRow = {
  code: string;
  name: string;
  examType: ExamType;
  score: number;
  credits: number;
  coefficient: number;
  semester: number;
};

type CourseSeed = {
  code: string;
  name: string;
  credits: number;
  coefficient: number;
  semester: number;
  scores: Partial<Record<ExamType, number>>;
};

const examTypeOrder: Record<ExamType, number> = {
  MIDTERM: 0,
  ASSIGNMENT: 1,
  QUIZ: 2,
  PROJECT: 3,
  FINAL: 4,
  EXAM: 5,
};

const courseSeeds: CourseSeed[] = [
  {
    code: "MATH101",
    name: "Advanced Mathematics I",
    credits: 4,
    coefficient: 3,
    semester: 1,
    scores: { MIDTERM: 15.5, FINAL: 17.5, QUIZ: 16.0 },
  },
  {
    code: "CS101",
    name: "Introduction to Programming",
    credits: 4,
    coefficient: 3,
    semester: 1,
    scores: { MIDTERM: 18.0, FINAL: 18.75, PROJECT: 18.5 },
  },
  {
    code: "PHY101",
    name: "Physics I",
    credits: 3,
    coefficient: 2,
    semester: 1,
    scores: { MIDTERM: 13.5, FINAL: 16.0, ASSIGNMENT: 14.75 },
  },
  {
    code: "ENG101",
    name: "Academic English",
    credits: 2,
    coefficient: 1,
    semester: 1,
    scores: { MIDTERM: 15.0, FINAL: 16.2, ASSIGNMENT: 15.6 },
  },
  {
    code: "STAT101",
    name: "Probability and Statistics",
    credits: 3,
    coefficient: 2,
    semester: 1,
    scores: { MIDTERM: 17.0, FINAL: 17.4, QUIZ: 17.2 },
  },
  {
    code: "CS102",
    name: "Computer Architecture",
    credits: 3,
    coefficient: 2,
    semester: 1,
    scores: { MIDTERM: 13.0, FINAL: 14.8, PROJECT: 13.9 },
  },

  {
    code: "MATH102",
    name: "Advanced Mathematics II",
    credits: 4,
    coefficient: 3,
    semester: 2,
    scores: { MIDTERM: 16.5, FINAL: 17.7, QUIZ: 16.8 },
  },
  {
    code: "CS201",
    name: "Data Structures and Algorithms",
    credits: 4,
    coefficient: 3,
    semester: 2,
    scores: { MIDTERM: 18.0, FINAL: 19.5, PROJECT: 18.75 },
  },
  {
    code: "CS202",
    name: "Object-Oriented Programming",
    credits: 4,
    coefficient: 3,
    semester: 2,
    scores: { MIDTERM: 17.0, FINAL: 18.8, ASSIGNMENT: 17.9 },
  },
  {
    code: "PHY102",
    name: "Physics II",
    credits: 3,
    coefficient: 2,
    semester: 2,
    scores: { MIDTERM: 14.4, FINAL: 16.4, ASSIGNMENT: 15.4 },
  },
  {
    code: "ENG102",
    name: "Technical Writing",
    credits: 2,
    coefficient: 1,
    semester: 2,
    scores: { MIDTERM: 15.4, FINAL: 17.0, ASSIGNMENT: 16.2 },
  },
  {
    code: "STAT201",
    name: "Applied Statistics",
    credits: 3,
    coefficient: 2,
    semester: 2,
    scores: { MIDTERM: 17.6, FINAL: 18.4, QUIZ: 18.0 },
  },

  {
    code: "CS301",
    name: "Database Systems",
    credits: 4,
    coefficient: 3,
    semester: 3,
    scores: { MIDTERM: 18.0, FINAL: 19.2, PROJECT: 18.6 },
  },
  {
    code: "CS302",
    name: "Operating Systems",
    credits: 4,
    coefficient: 3,
    semester: 3,
    scores: { MIDTERM: 16.8, FINAL: 18.0, QUIZ: 17.4 },
  },
  {
    code: "CS303",
    name: "Computer Networks",
    credits: 3,
    coefficient: 2,
    semester: 3,
    scores: { MIDTERM: 16.0, FINAL: 17.8, ASSIGNMENT: 16.9 },
  },
  {
    code: "MATH301",
    name: "Linear Algebra",
    credits: 4,
    coefficient: 3,
    semester: 3,
    scores: { MIDTERM: 17.5, FINAL: 18.7, QUIZ: 18.1 },
  },
  {
    code: "CS304",
    name: "Web Development",
    credits: 4,
    coefficient: 3,
    semester: 3,
    scores: { MIDTERM: 18.5, FINAL: 19.5, PROJECT: 19.0 },
  },
  {
    code: "ENG201",
    name: "Communication Skills",
    credits: 2,
    coefficient: 1,
    semester: 3,
    scores: { MIDTERM: 16.0, FINAL: 17.0, ASSIGNMENT: 16.5 },
  },
];

export const mockGrades: GradeRow[] = courseSeeds
  .flatMap((course) =>
    (Object.entries(course.scores) as [ExamType, number][]).map(
      ([examType, score]) => ({
        code: course.code,
        name: course.name,
        examType,
        score,
        credits: course.credits,
        coefficient: course.coefficient,
        semester: course.semester,
      }),
    ),
  )
  .sort(
    (a, b) =>
      a.semester - b.semester ||
      a.code.localeCompare(b.code) ||
      examTypeOrder[a.examType] - examTypeOrder[b.examType],
  );
