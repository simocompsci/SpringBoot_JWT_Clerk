import api, { getAuthHeaders } from "@/lib/api";
import type { GradeResponse } from "@/lib/types";

export async function getStudentGrades(
  getToken: () => Promise<string | null>,
) {
  const response = await api.get<GradeResponse[]>("/grades", {
    headers: await getAuthHeaders(getToken),
  });

  return response.data;
}
