import React from "react";
import TestimonialsCard from "./TestimonialsCard";
import { testimonials } from "@/constants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";

const Testimonials = () => {
  return (
    <>
      <section className="w-full space-y-8 my-14">
        <div className="space-y-5 flex flex-col text-center items-center px-3">
          <h1 className="md:text-[36px] sm:text-[24px] text-[22px] font-bold text-[#424242]">
            Apa Kata Pelanggan Kami?
          </h1>
          <p className="text-paragraph w-full md:text-[18px] text-[14px]">
            Dengarkan langsung dari pelanggan kami bagaimana layanan kami membantu mereka menjaga kebersihan lingkungan dengan mudah dan praktis.
          </p>
        </div>
        <Swiper
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            waitForTransition: true,
          }}
          modules={[Autoplay, Navigation]}
          breakpoints={{
            340: {
              slidesPerView: 0.7,
            },
            440: {
              slidesPerView: 1.2,
            },
            640: {
              slidesPerView: 1.6,
            },
            768: {
              slidesPerView: 1.9,
            },
            1024: {
              slidesPerView: 2.3,
            },
            1100: {
              slidesPerView: 2.7,
            },
            1200: {
              slidesPerView: 2.9,
            },
            1300: {
              slidesPerView: 3.4,
            },
            1500: {
              slidesPerView: 3.6,
            },
            1700: {
              slidesPerView: 4.2,
            },
            1900: {
              slidesPerView: 4.3,
            },
            2100: {
              slidesPerView: 5.3,
            },
          }}
        >
          {testimonials.map((card) => (
            <SwiperSlide className="px-2" key={card.id}>
              <TestimonialsCard {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Swiper
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            waitForTransition: true,
          }}
          modules={[Autoplay, Navigation]}
          breakpoints={{
            340: {
              slidesPerView: 0.7,
            },
            440: {
              slidesPerView: 1.2,
            },
            640: {
              slidesPerView: 1.6,
            },
            768: {
              slidesPerView: 1.9,
            },
            1024: {
              slidesPerView: 2.3,
            },
            1100: {
              slidesPerView: 2.7,
            },
            1200: {
              slidesPerView: 2.9,
            },
            1300: {
              slidesPerView: 3.4,
            },
            1500: {
              slidesPerView: 3.6,
            },
            1700: {
              slidesPerView: 4.2,
            },
            1900: {
              slidesPerView: 4.3,
            },
            2100: {
              slidesPerView: 5.3,
            },
          }}
        >
          {testimonials.map((card) => (
            <SwiperSlide className="px-2" key={card.id}>
              <TestimonialsCard {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
};

export default Testimonials;
