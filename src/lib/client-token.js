export async function getClientToken() {
  const res = await fetch("/api/token");
  if (!res.ok) throw new Error("Unauthorized");
  const { token } = await res.json();
  return token;
}