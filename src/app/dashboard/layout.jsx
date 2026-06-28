/* eslint-disable react-hooks/static-components */
"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import {
  BookOpen, LayoutDashboard, Truck, BookMarked,
  Star, Users, Library, LogOut, User, Menu, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const navByRole = {
  user: [
    { label: "Overview",        href: "/dashboard/user",              icon: LayoutDashboard },
    { label: "Delivery History", href: "/dashboard/user/deliveries",  icon: Truck },
    { label: "Reading List",    href: "/dashboard/user/reading-list", icon: BookMarked },
    { label: "My Reviews",      href: "/dashboard/user/reviews",      icon: Star },
  ],
  librarian: [
    { label: "Overview",          href: "/dashboard/librarian",          icon: LayoutDashboard },
    { label: "Manage Books",      href: "/dashboard/librarian/books",    icon: Library },
    { label: "Delivery Requests", href: "/dashboard/librarian/requests", icon: Truck },
  ],
  admin: [
    { label: "Overview",      href: "/dashboard/admin",             icon: LayoutDashboard },
    { label: "All Users",     href: "/dashboard/admin/users",       icon: Users },
    { label: "All Books",     href: "/dashboard/admin/books",       icon: Library },
    { label: "Approvals",     href: "/dashboard/admin/approvals",   icon: ShieldCheck },
    { label: "All Deliveries", href: "/dashboard/admin/deliveries", icon: Truck },
  ],
};

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = session?.user?.role || "user";
  const navItems = navByRole[role] || navByRole.user;
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out.");
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 shrink-0 ${collapsed ? "justify-center" : ""}`}
      >
        <BookOpen size={22} className="text-[#008854] shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-dance text-lg text-[#008854] font-bold overflow-hidden whitespace-nowrap"
            >
              Boimohol
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Nav — scrollable */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#008854] text-white"
                  : "text-gray-600 hover:bg-[#008854]/8 hover:text-[#008854]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:flex px-3 pb-2 shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition ${collapsed ? "justify-center" : ""}`}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <Menu size={15} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Bottom — user + logout */}
      <div className="px-2 pb-4 border-t border-gray-100 pt-3 space-y-0.5 shrink-0">
        <Link
          href="/dashboard/account"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#008854]/8 hover:text-[#008854] transition-all ${collapsed ? "justify-center" : ""}`}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={20}
              height={20}
              className="rounded-full shrink-0 w-5 h-5 object-cover"
            />
          ) : (
            <User size={18} className="shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {user?.name || "Account"}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    // KEY FIX: h-screen overflow-hidden on outer, sidebar is fixed height, main scrolls independently
    <div className="h-screen overflow-hidden bg-[#f5f5eb] flex">

      {/* Desktop sidebar — fixed height, never clips */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-56 bg-white z-30 lg:hidden flex flex-col shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main — takes remaining width, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#008854]" />
            <Link href="/" className="font-dance text-base text-[#008854] font-bold">
              Boimohol
            </Link>
          </div>
          <div className="w-5" />
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}