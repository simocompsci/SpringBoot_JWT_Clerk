import api from "@/lib/api";

import { CourseAverage , SemesterAverage } from "@/lib/workspace-data";

export async function getCoursesAverage( getToken: () => Promise<string | null> ) {

  const token = await getToken();

  const response = await api.get<CourseAverage[]>("/stats/courses/average", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getSemesterAverage( getToken: () => Promise<string | null> ) {

  const token = await getToken();

  const response = await api.get<SemesterAverage[]>("/stats/semesters/average", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
