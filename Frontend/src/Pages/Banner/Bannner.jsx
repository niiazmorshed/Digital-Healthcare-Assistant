import { NavLink } from "react-router-dom";
import { A11y, EffectFade, Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

const Bannner = () => {
  return (
    <Swiper
      modules={[Navigation, Scrollbar, A11y, EffectFade]}
      spaceBetween={50}
      slidesPerView={1}
      effect="fade"
      navigation
      scrollbar={{ draggable: true }}
      autoplay={{delay: 1500}}
    >
      <SwiperSlide>
        <section className="banner1">
          <section className="pt-32">
            <div className="md: flex flex-col justify-center text-center items-center gap-6 md:pt-6 min-h-screen">
              <div className="animate__animated animate__lightSpeedInLeft flex gap-6">
                <NavLink to="/doctors">
                  {" "}
                  <button className="btn btn-outline text-white">Find Doctors</button>
                </NavLink>
              </div>
            </div>
          </section>
        </section>
      </SwiperSlide>
    </Swiper>
  );
};

export default Bannner;
