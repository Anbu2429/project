const API_BASE = 'http://localhost:8080/api/threat';
const AUTH_API = 'http://localhost:8080/api/auth/login';

// LOGIN
export const loginUser = async (loginData) => {
  const response = await fetch(AUTH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData)
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return response.json();
};

// ANALYZE
export const analyzeThreatAPI = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error("Backend error or unauthorized");
  }

  return response.json();
};

// FETCH LOGS
export const fetchLogsAPI = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to fetch logs");
  }

  return response.json();
};