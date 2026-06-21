"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Parallax } from "swiper/modules";
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
    <section className="w-full mt-15">
      <div className="max-w-6xl mx-auto px-4">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, Parallax]}
          speed={600}
          loop={true}
          parallax={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
          }}
          className="rounded-md"
        >
          {banners.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-[180px] sm:h-[260px] md:h-[340px] lg:h-[420px]">
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
          <div className="swiper-button-prev !text-white"></div>
          <div className="swiper-button-next !text-white"></div>
          <div className="swiper-pagination"></div>
        </Swiper>
      </div>
    </section>
  );
}