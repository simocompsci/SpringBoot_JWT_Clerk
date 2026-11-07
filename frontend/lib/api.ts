import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAuthHeaders( getToken: () => Promise<string | null>) {
  const token = await getToken();

  if (!token) {
    throw new Error("No active session");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export default api;
