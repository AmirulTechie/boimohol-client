"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isSelectRole = pathname === "/auth/select-role";

  useEffect(() => {
    if (!isPending && session && !isSelectRole) {
      router.replace("/");
    }
  }, [session, isPending, router, isSelectRole]);

  if (isPending) return (
    <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-3 border-[#008854]/20 border-t-[#008854] animate-spin" />
    </div>
  );

  if (session && !isSelectRole) return null;

  return <>{children}</>;
}