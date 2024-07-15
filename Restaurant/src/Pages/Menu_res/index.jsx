import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./style.css";
import Footer from "../../components/Footer";
import { getAll } from "../../services/menu_res.js";

const Menu_res = () => {
  const [foodMenus, setFoodMenus] = useState([]);
  const [drinkMenus, setDrinkMenus] = useState([]);
  const location = useLocation();
  const { category } = location.state || {};
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMenus = async () => {
    try {
      const result = await getAll();
      const menus = result.data.menuslist;
      console.log(menus);

      const foodItems = menus.filter(
        (menu) => menu.classify === "Món ăn" && menu.category === category
      );
      const drinkItems = menus.filter(
        (menu) => menu.classify === "Đồ uống" && menu.category === category
      );

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
    navigate(-1);
  };

  useEffect(() => {
    if (category) {
      fetchMenus();
    } else {
      setError("Không tìm thấy danh mục");
    }
  }, [category]);

  return (
    <div className="menu-res">
      <div className="menu-res-nav">
        <Link to={"/"}>
          <div className="menu-res-logo">
            <img src="../../public/logo_image.png" alt="logo" width={180} />
          </div>
        </Link>

        <div className="menu-res-btn">
          <button className="menuBtn" onClick={handleBackToMenu}>
            Back to Our Menu
          </button>
        </div>
      </div>
      <div className="menu-res-title">{category}</div>

      <div className="menu-res-item">
        <div className="menu-res-item-image">
          <img
            src="https://i0.wp.com/blog.petpooja.com/wp-content/uploads/2021/10/cultural-cuisine.jpg?resize=696%2C385&ssl=1"
            alt="Food"
          />
        </div>
        <div className="menu-res-item-content">
          <h1>MÓN ĂN</h1>
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
          <h1>THỨC UỐNG</h1>
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
          <img
            src="https://www.mashed.com/img/gallery/50-agree-that-these-2-chain-restaurants-have-the-best-specialty-cocktails/l-intro-1626274321.jpg"
            alt="Drink"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Menu_res;
