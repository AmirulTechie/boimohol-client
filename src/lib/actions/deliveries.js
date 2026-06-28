import { getClientToken } from "@/lib/client-token";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const CreateDelivery = async (data) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetAllDeliveries = async () => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetDeliveriesByUser = async (userId) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries/user/${userId}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const GetDeliveriesByLibrarian = async (librarianId) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries/librarian/${librarianId}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const UpdateDeliveryStatus = async (id, status) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};