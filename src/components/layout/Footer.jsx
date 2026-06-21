import Image from "next/image";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTelegram,
  IconBrandX,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="bg-[#0d6b3e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/assets/boimohol-logo.png"
                alt="Boimohol Logo"
                width={36}
                height={36}
                className="invert"
              />
              <span className="font-dance text-2xl font-bold">Boimohol</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your one-stop destination for discovering and ordering books across
              Bangladesh. Read more, learn more.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-base mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/books" className="hover:text-white transition">Browse Books</Link></li>
              <li><Link href="/categories" className="hover:text-white transition">Categories</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-base mb-3">Our Address</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Chittagong, Bangladesh</li>
              <li>Mobile: 01993-567044</li>
              <li>Email: boimohol@gmail.com</li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <Link href="#"><IconBrandFacebook size={20} className="hover:text-white text-white/80 transition" /></Link>
              <Link href="#"><IconBrandX size={20} className="hover:text-white text-white/80 transition" /></Link>
              <Link href="#"><IconBrandInstagram size={20} className="hover:text-white text-white/80 transition" /></Link>
              <Link href="#"><IconBrandYoutube size={20} className="hover:text-white text-white/80 transition" /></Link>
              <Link href="#"><IconBrandTelegram size={20} className="hover:text-white text-white/80 transition" /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20 py-4 text-center text-sm text-white/70">
        © {new Date().getFullYear()} <span className="font-semibold text-white">Boimohol</span> | All Rights Reserved.
      </div>
    </footer>
  );
}