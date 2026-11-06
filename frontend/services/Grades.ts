import api from "@/lib/api";
import { GradeResponse } from "@/lib/types";

export async function getStudentGrades(getToken: () => Promise<string | null>) {
    
  const token = await getToken();

  const response = await api.get<GradeResponse[]>("/grades", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
