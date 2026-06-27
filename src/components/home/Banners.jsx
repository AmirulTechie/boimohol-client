"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { motion } from "motion/react";
const banners = [
  "/assets/boimohol-banner-03.png",
  "/assets/boimohol-banner-04.png",
  "/assets/boimohol-banner-05.png",
];

export default function BannerSection() {
  return (
    <section className="w-full mt-6 mb-20">
      <div className="max-w-6xl mx-auto px-4">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        speed={600}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        className="rounded-md"
      >
        {banners.map((src, i) => (
          <SwiperSlide key={i}>
            {/* aspect-ratio approach — no fixed height, fully responsive */}
            <div className="relative w-full aspect-16/7 sm:aspect-16/6 md:aspect-16/5">
              <Image
                src={src}
                alt={`Banner ${i + 1}`}
                fill
                className="object-cover object-center"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
      <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-center mt-10"
        >
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 border border-[#008854] text-[#008854] hover:bg-[#008854] hover:text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors duration-200"
          >
            All Books
            <FiArrowRight size={15} />
          </Link>
        </motion.div>
    </section>
  );
}