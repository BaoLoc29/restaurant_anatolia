import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./Confrim.css"
import { scroller } from "react-scroll"; // Import scroller từ react-scroll

const Confirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state;

  const handleConfirm = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/reservation/send",
        reservationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      navigate("/success");
    } catch (error) {
      console.error("Lỗi:", error);
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate("/", { state: reservationData });
    setTimeout(() => {
      scroller.scrollTo("reservation", {
        duration: 2000,
        delay: 0,
        smooth: "easeInOutQuart",
      });
    }, 100); // Đảm bảo rằng trang đã điều hướng trước khi cuộn
  };

  if (!reservationData) {
    navigate("/");
    return null;
  }

  return (
    <section className="confirm">
      <div className="container">
        <div className="confirm_box">
          <h1>Xác Nhận Đặt Chỗ</h1>
          <div className="confirm_details">
            <p><strong>Họ và tên:</strong> {reservationData.name}</p>
            <p><strong>Email:</strong> {reservationData.email}</p>
            <p><strong>Điện thoại:</strong> {reservationData.phone}</p>
            <p><strong>Ngày:</strong> {reservationData.date}</p>
            <p><strong>Giờ:</strong> {reservationData.time}</p>
            <p><strong>Số lượng khách:</strong> {reservationData.guests}</p>
            <p><strong>Ghi chú:</strong> {reservationData.notes}</p>
          </div>
          <div className="confirm_buttons">
            <button onClick={handleConfirm}>Xác nhận</button>
            <button onClick={handleBack} className="back_button">Quay lại</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Confirm;
