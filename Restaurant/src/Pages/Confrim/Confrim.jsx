import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { scroller } from "react-scroll";
import { Radio } from "antd";
import "./Confrim.css";

const Confirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state;
  const [loading, setLoading] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [depositOption, setDepositOption] = useState(null);

  useEffect(() => {
    setErrorMessage("");
    if (reservationData) {
      setFormattedDate(formatDateToMMDDYYYY(reservationData.date));
    }
  }, [reservationData]);
  const handleConfirm = async () => {
    if (depositOption === null) {
      setErrorMessage("Bạn phải chọn một tùy chọn đặt cọc.");
      return;
    }

    const updatedReservationData = {
      ...reservationData,
      deposit: depositOption === 2,
      depositAmount: depositOption === 2 ? 200000 : 0,
    };

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:4000/reservation/send",
        updatedReservationData,
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
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
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
    }, 100);
  };

  const formatDateToMMDDYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  if (!reservationData) {
    navigate("/");
    return null;
  }

  return (
    <section className="confirm">
      <div className="container">
        <div className="confirm_box">
          <img src="../../../public/logo_image.png" alt="" className="logo" />
          <h1>Xác Nhận Đặt Chỗ</h1>
          <p>
            Nếu bạn đặt cọc tối thiểu 200.000đ, bạn sẽ được giữ chỗ lâu hơn 30
            phút!
          </p>
          <table className="confirm_details">
            <tbody>
              <tr className="detail_item">
                <th className="label">Họ và tên:</th>
                <td>{reservationData.name}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Email:</th>
                <td>{reservationData.email}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Điện thoại:</th>
                <td>{reservationData.phone}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Ngày:</th>
                <td>{formattedDate}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Giờ:</th>
                <td>{reservationData.time}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Số lượng khách:</th>
                <td>{reservationData.guests}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Ghi chú:</th>
                <td>{reservationData.notes}</td>
              </tr>
              <tr className="detail_item">
                <th className="label">Đặt cọc</th>
                <td>
                  <Radio.Group
                    name="radiogroup"
                    defaultValue={0}
                    onChange={(e) => setDepositOption(e.target.value)}
                  >
                    <Radio value={1}>Không cọc</Radio>
                    <Radio value={2}>Đặt cọc (200.000đ)</Radio>
                  </Radio.Group>
                </td>
              </tr>
            </tbody>
          </table>
          <span className="error">{errorMessage}</span>
          <div className="confirm_buttons">
            <button onClick={handleBack} className="back_button">
              Quay lại
            </button>
            <button onClick={handleConfirm} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Confirm;
