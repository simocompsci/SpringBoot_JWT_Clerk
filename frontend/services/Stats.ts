import api, { getAuthHeaders } from "@/lib/api";
import type { CourseAverage, SemesterAverage } from "@/lib/types";

export async function getCoursesAverage(
  getToken: () => Promise<string | null>,
) {
  const response = await api.get<CourseAverage[]>("/stats/courses/average", {
    headers: await getAuthHeaders(getToken),
  });

  return response.data;
}

export async function getSemesterAverage(
  getToken: () => Promise<string | null>,
) {
  const response = await api.get<SemesterAverage[]>("/stats/semesters/average",
    {
      headers: await getAuthHeaders(getToken),
    },
  );

  return response.data;
}
