import React from "react";
import { useNavigate } from "react-router-dom";
import { data } from "../restApi.json";

const Menu = () => {
  const navigate = useNavigate();
  const handleCategoryClick = (category) => {
    navigate("/menu-res", { state: { category } });
    window.scrollTo(0, 0);
  };
  return (
    <section className="menu" id="menu">
      <div className="container">
        <div className="heading_section">
          <h1 className="heading">POPULAR DISHES</h1>
          <p>
            Đến với Anatolia thực khách sẽ được khám phá ra được kho tàng ẩm
            thực nơi đây cùng đa dạng các món ăn theo từng chủ đề
          </p>
        </div>
        <div className="dishes_container">
          {data[0].dishes.map((element) => (
            <div
              className="card"
              key={element.id}
              onClick={() => handleCategoryClick(element.category)}
            >
              <img src={element.image} alt={element.title} />
              <h3>{element.title}</h3>
              <button>{element.category}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;
