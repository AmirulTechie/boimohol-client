'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAuthToken() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: no active session");
  }

  const token = jwt.sign(
    {
      userId: session.user.id,
      email:  session.user.email,
      role:   session.user.role ?? "user",
    },
    process.env.BETTER_AUTH_SECRET,
    { expiresIn: "15m" }
  );

  return token;
}