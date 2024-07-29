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
  const [state, setState] = useState({
    loading: false,
    formattedDate: "",
    errorMessage: "",
    depositOption: null,
  });

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      errorMessage: "",
      formattedDate: reservationData
        ? formatDateToMMDDYYYY(reservationData.date)
        : "",
    }));
  }, [reservationData]);

  const handleConfirm = async () => {
    if (state.depositOption === null) {
      setState((prevState) => ({
        ...prevState,
        errorMessage: "Bạn phải chọn một tùy chọn đặt cọc.",
      }));
      return;
    }

    const updatedReservationData = {
      ...reservationData,
      deposit: state.depositOption === 2,
      depositAmount: state.depositOption === 2 ? 200000 : 0,
    };

    if (state.depositOption === 2) {
      setState((prevState) => ({ ...prevState, loading: true }));
      try {
        const { data } = await axios.post(
          "http://localhost:4000/payment/create-checkout-session",
          updatedReservationData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        console.log("Stripe session URL:", data.session_url);
        window.location.href = data.session_url;
      } catch (error) {
        console.error("Error:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau.";
        setState((prevState) => ({ ...prevState, errorMessage }));
      } finally {
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    } else {
      try {
        setState((prevState) => ({ ...prevState, loading: true }));
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
        console.log("Reservation saved:", data);
        navigate(`/success?reservationId=${data.reservation._id}`);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau.";
        setState((prevState) => ({ ...prevState, errorMessage }));
      } finally {
        setState((prevState) => ({ ...prevState, loading: false }));
      }
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
          <img src="/logo_image.png" alt="Logo" className="logo" />
          <h1>Xác Nhận Đặt Chỗ</h1>
          <p>
            Nếu bạn đặt cọc tối thiểu 200.000đ, bạn sẽ được giữ chỗ lâu hơn 30
            phút!
          </p>
          <table className="confirm_details">
            <tbody>
              {[
                ["Họ và tên", reservationData.name],
                ["Email", reservationData.email],
                ["Điện thoại", reservationData.phone],
                ["Ngày", state.formattedDate],
                ["Giờ", reservationData.time],
                ["Số lượng khách", reservationData.guests],
                ["Ghi chú", reservationData.notes],
              ].map(([label, value], index) => (
                <tr className="detail_item" key={index}>
                  <th className="label">{label}:</th>
                  <td>{value}</td>
                </tr>
              ))}
              <tr className="detail_item">
                <th className="label">Đặt cọc</th>
                <td>
                  <Radio.Group
                    name="radiogroup"
                    defaultValue={0}
                    onChange={(e) =>
                      setState((prevState) => ({
                        ...prevState,
                        depositOption: e.target.value,
                        errorMessage: "", // Xóa thông báo lỗi khi thay đổi
                      }))
                    }
                  >
                    <Radio value={1}>Không cọc</Radio>
                    <Radio value={2}>Đặt cọc (200.000đ)</Radio>
                  </Radio.Group>
                </td>
              </tr>
            </tbody>
          </table>
          {state.errorMessage && (
            <span className="error">{state.errorMessage}</span>
          )}
          <div className="confirm_buttons">
            <button onClick={handleBack} className="back_button">
              Quay lại
            </button>
            <button onClick={handleConfirm} disabled={state.loading}>
              {state.loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Confirm;
