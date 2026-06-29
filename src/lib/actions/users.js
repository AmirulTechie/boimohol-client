import { getClientToken } from "@/lib/client-token";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const GetAllUsers = async () => {
  const token = await getClientToken();
  const res = await fetch(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetMe = async () => {
  const token = await getClientToken();
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateMe = async ({ name, image }) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, image }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};