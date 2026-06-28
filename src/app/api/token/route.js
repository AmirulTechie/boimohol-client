import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = jwt.sign(
      { userId: session.user.id, email: session.user.email, role: session.user.role ?? "user" },
      process.env.BETTER_AUTH_SECRET,
      { expiresIn: "15m" }
    );
    return Response.json({ token });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}