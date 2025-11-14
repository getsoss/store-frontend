import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: true,
    autoplaySpeed: 3000,

    // 점(dots)의 스타일을 커스텀하기 위해 tailwind-slick-dots 플러그인 등이 필요할 수 있으나,
    // 기본적으로는 dots: true만 설정
  };
  return (
    // slider-container에 너비, 중앙 정렬, 패딩 추가
    <div className="slider-container w-full py-[40px]">
      <Slider {...settings}>
        <div className="w-[500px] h-[500px]">
          {/* 슬라이드 내용에 배경, 텍스트 스타일 적용 */}
          <h3 className="bg-blue-500 text-white p-10 font-bold  shadow-lg h-100 w-100 ">
            1
          </h3>
        </div>
        <div className="w-100 h-100">
          <h3 className="bg-green-500 text-white p-10 text-3xl font-bold  shadow-lg h-100 w-100">
            2
          </h3>
        </div>
        <div>
          <h3 className="bg-red-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            3
          </h3>
        </div>
        <div>
          <h3 className="bg-yellow-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            4
          </h3>
        </div>
        <div>
          <h3 className="bg-purple-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            5
          </h3>
        </div>
        <div>
          <h3 className="bg-pink-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            6
          </h3>
        </div>
        <div>
          <h3 className="bg-indigo-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            7
          </h3>
        </div>
        <div>
          <h3 className="bg-teal-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            8
          </h3>
        </div>
        <div>
          <h3 className="bg-orange-500 text-white p-10   text-3xl font-bold  shadow-lg h-100 w-100">
            9
          </h3>
        </div>
      </Slider>
    </div>
  );
}

export default Carousel;
