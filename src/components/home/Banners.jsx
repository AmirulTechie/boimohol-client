"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";

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
    </section>
  );
}