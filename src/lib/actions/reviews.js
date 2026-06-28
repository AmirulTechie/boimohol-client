import { getClientToken } from "@/lib/client-token";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const GetReviewsByBook = async (bookId) => {
  const res = await fetch(`${API}/reviews/${bookId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetReviewsByUser = async (userId) => {
  const res = await fetch(`${API}/reviews/user/${userId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const PostReview = async (data) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to post review');
  }
  return res.json();
};

export const DeleteReview = async (id) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/reviews/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateReview = async (id, data) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/reviews/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};