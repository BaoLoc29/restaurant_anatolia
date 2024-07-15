import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import data from "../../data/restaurants.js";
import RestaurantCard from "../R_C_List/Restaurant_Card";
import Slider from "react-slick";
import "./style.css";

const RestaurantCardList = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 3000,
    centerPadding: "60px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0,
        },
      },
    ],
  };
  return (
    <div className="app">
      <p className="title_menu">OUR RESTAURANTS</p>
      <Slider {...settings}>
        {data.restaurants.map((restaurant) => (
          <div className="slider" key={restaurant.id}>
            <RestaurantCard restaurant={restaurant} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RestaurantCardList;
