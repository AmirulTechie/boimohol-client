"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import {
  IconSearch,
  IconUser,
  IconMenu2,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { GiSchoolBag } from "react-icons/gi";

const useAuth = () => {
  return { user: null, role: null };
};

export default function Navbar() {
  const { user, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScrollY.current && current > 60);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search:", searchQuery);
    }
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

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:text-green-200 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconX size={22} stroke={1.5} /> : <IconMenu2 size={22} stroke={1.5} />}
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0 md:mr-6">
            <Image src="/assets/boimohol-logo.png" alt="Boimohol logo" width={40} height={40} className="invert" />
            <span className="text-xl md:text-2xl font-semibold text-white font-dance">Boimohol</span>
          </Link>

          {/* Search — desktop, home only */}
          {isHome && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 items-center bg-white rounded-lg overflow-hidden h-10 focus-within:ring-2 focus-within:ring-white/40 transition-all"
            >
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 h-full text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
              />
              <button type="submit" className="h-full px-4 bg-[#0F6E56] hover:bg-[#085041] transition-colors flex items-center justify-center shrink-0">
                <IconSearch size={17} color="white" stroke={1.8} />
              </button>
            </form>
          )}

          <div className="flex items-center gap-4 shrink-0">
            <Link href="/cart" className="relative flex items-center text-white hover:text-green-200 transition-colors" aria-label="Cart">
              <GiSchoolBag size={24} />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-[#0F6E56] text-[10px] font-semibold rounded-full flex items-center justify-center">0</span>
            </Link>

            {user ? (
              <Link href={getDashboardLink()} className="hidden md:flex items-center gap-1.5 text-sm font-medium text-white hover:text-green-200 transition-colors">
                <IconUser size={18} stroke={1.5} />
                Dashboard
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-white hover:text-green-200 transition-colors px-2 py-1.5">Log in</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-white text-[#0F6E56] hover:bg-green-50 transition-colors px-4 py-1.5 rounded-lg">Get started</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search — home only */}
        {isHome && (
          <div className="md:hidden px-4 pb-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-lg overflow-hidden h-10 focus-within:ring-2 focus-within:ring-white/40 transition-all"
            >
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 h-full text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
              />
              <button type="submit" className="h-full px-4 bg-[#0F6E56] hover:bg-[#085041] transition-colors flex items-center justify-center shrink-0">
                <IconSearch size={17} color="white" stroke={1.8} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* SECONDARY NAV */}
      <div className="hidden md:block bg-[#edf5e1] border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-10">
            <Link href="/" className={navLinkClass("/")}>Home</Link>
            <Link href="/browse" className={navLinkClass("/browse")}>Browse Books</Link>
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
              <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)} className="mt-3 text-center text-sm font-medium text-white bg-[#008854] py-2.5 rounded-lg">
                Dashboard
              </Link>
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