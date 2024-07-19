import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./style.css";
import Footer from "../../components/Footer";
import { getAll } from "../../services/menu_res.js";
import data from "../../restApi.json";

const Menu_res = () => {
  const [foodMenus, setFoodMenus] = useState([]);
  const [drinkMenus, setDrinkMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const location = useLocation();
  const { category } = location.state || {};
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMenus = async () => {
    try {
      const result = await getAll();
      const menus = result.data.menuslist;
      const dishes = data.data[0].dishes;
      console.log(menus);

      const foodItems = menus.filter(
        (menu) => menu.classify === "Món ăn" && menu.category === category
      );
      const drinkItems = menus.filter(
        (menu) => menu.classify === "Đồ uống" && menu.category === category
      );
      const dish = dishes.find((dish) => dish.category === category);
      const description = dish ? dish.description : "";

      setDishes(description);
      setFoodMenus(foodItems);
      setDrinkMenus(drinkItems);
    } catch (error) {
      console.error("Error fetching menus:", error);
      setError("Lỗi khi lấy dữ liệu!");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (error) {
    return <div>{error}</div>;
  }

  const handleBackToMenu = () => {
    navigate(-2);
  };

  useEffect(() => {
    if (category) {
      fetchMenus();
    } else {
      setError("Không tìm thấy danh mục");
    }
  }, [category]);

  const categoryImages = {
    "Bữa sáng": {
      image1: "./BG-MonAnSang.jpg",
      image2: "./BG-ThucUongSang.jpg",
    },
    "Bữa trưa": {
      image1: "./BG-MonAnTrua.jpg",
      image2: "./BG-ThucUongTrua.jpg",
    },
    "Bữa tối": {
      image1: "./BG-MonAnToi.jpg",
      image2: "./BG-ThucUongToi.jpg",
    },
    "Ngày tết": {
      image1: "./BG-MonAnTet.jpg",
      image2: "./BG-ThucUongTet.jpg",
    },
    Noel: {
      image1: "./BG-MonAnNoel.jpg",
      image2: "./BG-ThucUongNoel.jpg",
    },
    "Tình nhân": {
      image1: "./BG-MonAnVal.jpg",
      image2: "./BG-ThucUongVal.jpg",
    },
    "Gia đình": {
      image1: "./BG-MonAnGiaDinh.jpg",
      image2: "./BG-ThucUongGiaDinh.jpg",
    },
    "Lương về": {
      image1: "./BG-MonAnLuongve.jpg",
      image2: "./BG-ThucUongLuongve.jpg",
    },
  };
  const { image1, image2 } = categoryImages[category];

  return (
    <div className="menu-res">
      <div className="menu-res-nav">
        <Link to={"/"}>
          <div className="menu-res-logo">
            <img src="/logo_image.png" alt="logo" width={180} />
          </div>
        </Link>

        <div className="menu-res-btn">
          <button className="menuBtn" onClick={handleBackToMenu}>
            Back to Our Menu
          </button>
        </div>
      </div>
      <div className="menu-res-Background">
        <div className="menu-res-item">
          <div className="menu-res-item-image">
            <img src={image1} alt="Food" />
          </div>
          <div className="menu-res-item-content">
            <h1 style={{ color: "red" }}>{dishes}</h1>
            <table>
              <tbody>
                {foodMenus.slice(0, 8).map((menu) => (
                  <tr key={menu._id}>
                    <td>{menu.name}</td>
                    <td>{formatCurrency(menu.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="menu-res-item">
          <div className="menu-res-item-content">
            <table>
              <tbody>
                {drinkMenus.slice(0, 8).map((menu) => (
                  <tr key={menu._id}>
                    <td>{menu.name}</td>
                    <td>{formatCurrency(menu.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="menu-res-item-image">
            <img src={image2} alt="Drink" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Menu_res;
