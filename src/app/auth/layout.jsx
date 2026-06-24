"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) return (
  <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-3 border-[#008854]/20 border-t-[#008854] animate-spin" />
  </div>
);

  if (session) return null;

  return <>{children}</>;
}