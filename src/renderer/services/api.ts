const BASE_URL = "http://127.0.0.1:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// 🔥 CENTRALIZED HANDLER
async function handleResponse(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "auth/login";
    return;
  }

  return res.json();
}

export async function apiGet(url: string) {
  const res = await fetch(BASE_URL + url, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function apiPost(url: string, data: any) {
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
// PUT ✅
export async function apiPut(url: string, data: any) {
  const res = await fetch(BASE_URL + url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// DELETE ✅
export async function apiDelete(url: string) {
  const res = await fetch(BASE_URL + url, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
}