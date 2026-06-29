"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  IconMenu2,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { LuUser, LuLayoutDashboard, LuLogOut } from "react-icons/lu";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const role = session?.user?.role ?? null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScrollY.current && current > 60);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/");
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to log out. Please try again.");
        },
      },
    });
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "librarian") return "/dashboard/librarian";
    return "/dashboard/user";
  };

  const navLinkClass = (href) => {
    const isActive = pathname === href;
    return `text-sm px-3 py-1.5 rounded-md transition-colors ${
      isActive
        ? "text-[#008854] font-semibold bg-[#e6f2ed]"
        : "text-slate-600 hover:text-[#008854] hover:bg-slate-50"
    }`;
  };

  const mobileNavLinkClass = (href) => {
    const isActive = pathname === href;
    return `text-sm font-medium py-3 border-b border-slate-50 transition-colors ${
      isActive ? "text-[#008854] font-semibold" : "text-slate-700 hover:text-[#008854]"
    }`;
  };

  return (
    <motion.header
      className="w-full sticky top-0 z-50"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* TOP UTILITY BAR */}
      <div className="hidden md:block bg-[#0a5c46] text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <p className="text-[#9FE1CB]">Free delivery on your first order</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-[#9FE1CB] hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-[#9FE1CB] hover:text-white transition-colors">Contact</Link>
            <span className="text-[#9FE1CB] select-none">|</span>
            <span className="text-[#9FE1CB]">Hotline: 01993567044</span>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
      <div className="bg-[#008854]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16 gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:text-green-200 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconX size={22} stroke={1.5} /> : <IconMenu2 size={22} stroke={1.5} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/assets/boimohol-logo.png" alt="Boimohol logo" width={40} height={40} className="invert" />
            <span className="text-xl md:text-2xl font-semibold text-white font-dance">Boimohol</span>
          </Link>

          {/* Desktop nav links — centre */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <Link
              href="/"
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/"
                  ? "text-white font-semibold bg-white/20"
                  : "text-green-100 hover:text-white hover:bg-white/10"
              }`}
            >
              Home
            </Link>
            <Link
              href="/browse"
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/browse"
                  ? "text-white font-semibold bg-white/20"
                  : "text-green-100 hover:text-white hover:bg-white/10"
              }`}
            >
              Browse Books
            </Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Auth area */}
          <div className="flex items-center gap-4 shrink-0">
            {isPending ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-16 h-7 bg-white/20 rounded-lg animate-pulse" />
                <div className="w-24 h-7 bg-white/20 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              /* User dropdown */
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-green-200 transition-colors"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "User avatar"}
                      width={30}
                      height={30}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7.5 h-7.5 rounded-full bg-white/20 flex items-center justify-center">
                      <LuUser size={15} className="text-white" />
                    </div>
                  )}
                  <span>{user.name?.split(" ")[0] ?? "Account"}</span>
                  <IconChevronDown
                    size={14}
                    stroke={1.5}
                    className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-[#008854] hover:bg-slate-50 transition-colors"
                    >
                      <LuLayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:text-[#008854] hover:bg-slate-50 transition-colors"
                    >
                      <LuUser size={15} />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LuLogOut size={15} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-white hover:text-green-200 transition-colors px-2 py-1.5">Log in</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-white text-[#0F6E56] hover:bg-green-50 transition-colors px-4 py-1.5 rounded-lg">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECONDARY NAV — categories + dashboard */}
      <div className="hidden md:block bg-[#edf5e1] border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-10">
            <div className="relative group">
              <button className={`flex items-center gap-1 ${navLinkClass("#")}`}>
                Categories
                <IconChevronDown size={14} stroke={1.5} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-100 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {["Fiction", "Science", "Academic", "History", "Sci-Fi", "Self-Help"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/browse?category=${cat.toLowerCase()}`}
                    className="block px-4 py-2 text-sm text-slate-600 hover:text-[#008854] hover:bg-slate-50 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            {user && (
              <Link href={getDashboardLink()} className={navLinkClass(getDashboardLink())}>Dashboard</Link>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <nav className="px-4 py-2 flex flex-col">
            <Link href="/" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/")}>Home</Link>
            <Link href="/browse" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/browse")}>Browse Books</Link>

            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-3 mb-1">Categories</p>
            {["Fiction", "Science", "Academic", "History", "Sci-Fi", "Self-Help"].map((cat) => (
              <Link
                key={cat}
                href={`/browse?category=${cat.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-slate-500 py-2.5 border-b border-slate-50 pl-2 hover:text-[#008854] transition-colors"
              >
                {cat}
              </Link>
            ))}

            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-3 mb-1">More</p>
            <Link href="/about" onClick={() => setMobileOpen(false)} className={mobileNavLinkClass("/about")}>About</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className={`${mobileNavLinkClass("/contact")} border-b-0`}>Contact</Link>

            {user ? (
              <div className="mt-3 pb-2 flex flex-col gap-1.5">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-white bg-[#008854] py-2.5 px-4 rounded-lg"
                >
                  <LuLayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 py-2.5 px-4 rounded-lg hover:border-[#008854] transition-colors"
                >
                  <LuUser size={15} />
                  My Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-sm font-medium text-red-500 border border-red-100 py-2.5 px-4 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LuLogOut size={15} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-4 pb-2">
                <Link href="/auth/login" className="flex-1 text-center text-sm text-slate-700 border border-slate-200 py-2.5 rounded-lg hover:border-[#008854] transition-colors">Log in</Link>
                <Link href="/auth/register" className="flex-1 text-center text-sm text-white bg-[#008854] py-2.5 rounded-lg hover:bg-[#0F6E56] transition-colors">Get started</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}