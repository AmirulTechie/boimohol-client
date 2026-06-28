const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const CreateDelivery = async (data) => {
  const res = await fetch(`${API}/deliveries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetAllDeliveries = async () => {
  const res = await fetch(`${API}/deliveries`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetDeliveriesByUser = async (userId) => {
  const res = await fetch(`${API}/deliveries/user/${userId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetDeliveriesByLibrarian = async (librarianId) => {
  const res = await fetch(`${API}/deliveries/librarian/${librarianId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateDeliveryStatus = async (id, status) => {
  const res = await fetch(`${API}/deliveries/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};