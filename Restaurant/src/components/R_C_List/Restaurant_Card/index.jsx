import React from "react";
import "./style.css";
import { IoLocation } from "react-icons/io5";
import { IoIosTimer } from "react-icons/io";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="restaurant-image">
        <img src={restaurant.image} alt={restaurant.name} />
      </div>
      <div className="restaurant-info">
        <h2 className="restaurant-name">{restaurant.name}</h2>
        <p className="restaurant-description">{restaurant.description}</p>

        <div style={{ display: "flex", fontSize: "20px" }}>
          <div style={{ paddingRight: "10px" }}>
            <IoLocation />
          </div>
          <p className="restaurant-address">{restaurant.location}</p>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", fontSize: "20px" }}
        >
          <div div style={{ paddingRight: "10px" }}>
            <IoIosTimer />
          </div>
          <p className="restaurant-hours">
            Open: {restaurant.hours.open} - Close: {restaurant.hours.close}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
