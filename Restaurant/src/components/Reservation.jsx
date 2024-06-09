import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineArrowRight } from "react-icons/hi";

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (location.state) {
      const { name, email, date, time, phone, guests, notes } = location.state;
      setName(name);
      setEmail(email);
      setDate(date);
      setTime(time);
      setPhone(phone);
      setGuests(guests);
      setNotes(notes);
    }
  }, [location.state]);

  const handleReservation = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reservationData = { name, email, phone, date, time, guests, notes };
    navigate("/confirm", { state: reservationData });
  };

  const validateForm = () => {
    if (!name || !email || !date || !time || !phone || !guests) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email không hợp lệ.");
      return false;
    }

    if (!/^0/.test(phone) || phone.length !== 11) {
      toast.error("Số điện thoại không hợp lệ.");
      return false;
    }

    if (isNaN(guests) || guests < 1) {
      toast.error("Số lượng khách không hợp lệ.");
      return false;
    }

    return true;
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const currentDate = new Date();
    const currentOnlyDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (selectedDate < currentOnlyDate) {
      toast.error("Vui lòng chọn ngày từ hôm nay trở đi.");
      setDate("");
    } else {
      setDate(e.target.value);
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (selectedTime < "08:00" || selectedTime > "23:00") {
      toast.error("Thời gian mở cửa từ 8:00 sáng đến 11:00 tối.");
      setTime("");
    } else {
      setTime(selectedTime);
    }
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="banner">
          <img src="/reservation.png" alt="res" />
        </div>
        <div className="banner">
          <div className="reservation_form_box">
            <h1>ĐẶT CHỖ</h1>
            <p>Có thắc mắc gì, vui lòng gọi</p>
            <form onSubmit={handleReservation}>
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Số lượng khách"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="date"
                  placeholder="Ngày"
                  value={date}
                  onChange={handleDateChange}
                  required
                />
                <input
                  type="time"
                  placeholder="Giờ"
                  value={time}
                  onChange={handleTimeChange}
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="email_tag"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ghi chú"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button type="submit">
                ĐẶT NGAY{" "}
                <span>
                  <HiOutlineArrowRight />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
