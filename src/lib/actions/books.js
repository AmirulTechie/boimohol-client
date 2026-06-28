const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const GetAllBooks = async () => {
  const res = await fetch(`${API}/books`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetBookById = async (id) => {
  const res = await fetch(`${API}/books/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const CreateBook = async (data) => {
  const res = await fetch(`${API}/books`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateBook = async (id, data) => {
  const res = await fetch(`${API}/books/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const DeleteBook = async (id) => {
  const res = await fetch(`${API}/books/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};