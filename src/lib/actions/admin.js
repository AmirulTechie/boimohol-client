const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Users ─────────────────────────────────────────────────────

export const UpdateUserRole = async (userId, role) => {
  const res = await fetch(`${API}/users/${userId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteUser = async (userId) => {
  const res = await fetch(`${API}/users/${userId}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Books ─────────────────────────────────────────────────────

export const UpdateBookStatus = async (bookId, status) => {
  const res = await fetch(`${API}/books/${bookId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteBook = async (bookId) => {
  const res = await fetch(`${API}/books/${bookId}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};