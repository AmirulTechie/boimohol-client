import { getClientToken } from "@/lib/client-token";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const GetAllBooks = async () => {
  const res = await fetch(`${API}/books/all`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetBrowseBooks = async (params = {}) => {
  const { search = '', category = 'All', minFee = '', maxFee = '', availability = 'All', page = 1, limit = 10 } = params;
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (category !== 'All') query.set('category', category);
  if (minFee) query.set('minFee', minFee);
  if (maxFee) query.set('maxFee', maxFee);
  if (availability !== 'All') query.set('availability', availability);
  query.set('page', page);
  query.set('limit', limit);
  const res = await fetch(`${API}/books?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetBookById = async (id) => {
  const res = await fetch(`${API}/books/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const CreateBook = async (data) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/books`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateBook = async (id, data) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/books/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteBook = async (id) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/books/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};