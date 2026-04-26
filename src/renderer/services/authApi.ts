import { apiPost } from "./api";

export async function login(email: string, password: string) {
  const res = await apiPost("auth/login", { email, password });

  return res;
}