import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

interface CarouselProps {
  products: {
    imageUrl: string;
    productId: number;
    name: string;
    description?: string;
    price: number;
  }[];
}

function Carousel({ products }: CarouselProps) {
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: true,
    autoplaySpeed: 3000,
    draggable: false,
  };

  if (!products.length) return null;

  return (
    <div className="slider-container w-full">
      <Slider {...settings}>
        {products.map((p) => (
          <div
            key={p.productId}
            className="w-[500px] h-[500px] relative flex items-center justify-center cursor-pointer"
            onClick={() => router.push(`/products/${p.productId}`)}
          >
            <img
              src={p.imageUrl}
              alt={p.name}
              className="object-contain w-full"
            />
            {/* 좌측 하단 오버레이 */}
            <div className="absolute bottom-10 left-2 text-white p-2 rounded max-w-[90%]">
              <h4 className="font-semibold">{p.name}</h4>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Carousel;
