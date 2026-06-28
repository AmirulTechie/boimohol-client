import { getClientToken } from "@/lib/client-token";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const UpdateUserRole = async (userId, role) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/users/${userId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteUser = async (userId) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateBookStatus = async (bookId, status) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/books/${bookId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteBook = async (bookId) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/books/${bookId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};