import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineArrowRight } from "react-icons/hi";
import { format, isBefore, startOfToday, parse } from "date-fns";
import { vi } from "date-fns/locale";

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
  const [errors, setErrors] = useState({});

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
    const newErrors = {};

    if (!name) {
      newErrors.name = "Vui lòng nhập họ và tên của bạn!";
    }

    if (!email) {
      newErrors.email = "Vui lòng nhập địa chỉ email của bạn!";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Định dạng email không hợp lệ!";
      }
    }

    if (!date) {
      newErrors.date = "Vui lòng chọn ngày!";
    }

    if (!time) {
      newErrors.time = "Vui lòng chọn giờ!";
    }

    if (!phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại của bạn!";
    } else if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ! Vui lòng bắt đầu bằng số 0 và nhập 10 chữ số.";
    }

    if (!guests) {
      newErrors.guests = "Vui lòng nhập số lượng khách!";
    } else if (isNaN(guests) || guests < 1) {
      newErrors.guests = "Số lượng khách không hợp lệ!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (e) => {
    const selectedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
    const today = startOfToday();

    if (isBefore(selectedDate, today)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        date: "Vui lòng chọn ngày từ hôm nay trở đi.",
      }));
      setDate("");
    } else {
      setErrors((prevErrors) => {
        const { date, ...rest } = prevErrors;
        return rest;
      });
      setDate(e.target.value);
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const [selectedHour, selectedMinute] = selectedTime.split(":").map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (
      selectedHour < 8 ||
      selectedHour >= 23 ||
      (selectedHour === 23 && selectedMinute > 0)
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        time: "Giờ hoạt động từ 8:00 sáng đến 11:00 tối.",
      }));
      setTime("");
    } else if (
      selectedHour < currentHour ||
      (selectedHour === currentHour && selectedMinute < currentMinute)
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        time: "Vui lòng chọn thời gian khác.",
      }));
      setTime("");
    } else {
      setErrors((prevErrors) => {
        const { time, ...rest } = prevErrors;
        return rest;
      });
      setTime(selectedTime);
    }
  };

  const handleInputChange = (e, setter, field) => {
    setter(e.target.value);
    validateSingleField(field, e.target.value);
  };

  const validateSingleField = (field, value) => {
    let newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value) {
          newErrors.name = "Vui lòng nhập họ và tên của bạn!";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!value) {
          newErrors.email = "Vui lòng nhập địa chỉ email của bạn!";
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            newErrors.email = "Định dạng email không hợp lệ!";
          } else {
            delete newErrors.email;
          }
        }
        break;
      case "date":
        if (!value) {
          newErrors.date = "Vui lòng chọn ngày!";
        } else {
          delete newErrors.date;
        }
        break;
      case "time":
        if (!value) {
          newErrors.time = "Vui lòng chọn giờ!";
        } else {
          delete newErrors.time;
        }
        break;
      case "phone":
        if (!value) {
          newErrors.phone = "Vui lòng nhập số điện thoại của bạn!";
        } else if (!/^0\d{9}$/.test(value)) {
          newErrors.phone = "Số điện thoại không hợp lệ!";
        } else {
          delete newErrors.phone;
        }
        break;
      case "guests":
        if (!value) {
          newErrors.guests = "Vui lòng nhập số lượng khách!";
        } else if (isNaN(value) || value < 1) {
          newErrors.guests = "Số lượng khách không hợp lệ!";
        } else {
          delete newErrors.guests;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
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
                  onChange={(e) => handleInputChange(e, setName, "name")}
                  required
                />
                <input
                  type="number"
                  placeholder="Số lượng khách"
                  value={guests}
                  onChange={(e) => handleInputChange(e, setGuests, "guests")}
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
                  type="text"
                  placeholder="Email"
                  className="email_tag"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail, "email")}
                  required
                />

                <input
                  type="text"
                  placeholder="Điện thoại"
                  value={phone}
                  onChange={(e) => handleInputChange(e, setPhone, "phone")}
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
              {errors.name && <span className="error">{errors.name}</span>}
              {errors.guests && <span className="error">{errors.guests}</span>}
              {errors.time && <span className="error">{errors.time}</span>}
              {errors.date && <span className="error">{errors.date}</span>}
              {errors.email && <span className="error">{errors.email}</span>}
              {errors.phone && <span className="error">{errors.phone}</span>}
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
      <Toaster />
    </section>
  );
};

export default Reservation;
