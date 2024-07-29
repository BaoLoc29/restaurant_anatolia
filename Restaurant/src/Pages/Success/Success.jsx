import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import axios from "axios";
import "./Success.css";

const Success = () => {
  const [reservationDetails, setReservationDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reservationId = new URLSearchParams(location.search).get(
    "reservationId"
  );

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4000/reservation/details/${reservationId}`
        );
        if (data.success) {
          setReservationDetails(data.reservationDetails);
        }
      } catch (error) {
        console.error("Error fetching reservation details:", error);
      }
    };

    fetchReservationDetails();
  }, [reservationId]);

  const formatDateToDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!reservationDetails) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <section className="notFound">
      <div className="container">
        <div className="success-popup">
          <img src="/sandwich.png" alt="success" />
          <h1>Đặt bàn thành công!</h1>
          <div className="reservation-info">
            <p>
              <strong>Mã bàn của quý khách là: </strong>{" "}
              <b style={{ color: "red" }}>{reservationDetails.table}</b>
            </p>
            <p>
              <strong>Ngày đến: </strong>{" "}
              {formatDateToDDMMYYYY(reservationDetails.date)}
            </p>
            <p>
              <strong>Giờ đến: </strong> {reservationDetails.time}
            </p>
            <p>
              <strong>Thời gian giữ bàn của quý khách là: </strong>{" "}
              {reservationDetails.holdTime} phút
            </p>
          </div>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Cảm ơn quý khách đã tin tưởng và lựa chọn nhà hàng của chúng tôi.
          </p>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Chúc quý khách có một bữa ăn ngon miệng.
          </p>
          <Link to={"/"}>Back to Home</Link>
        </div>
      </div>
    </section>
  );
};

export default Success;
