import mongoose from "mongoose";
import validator from "validator";

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Last name must be of at least 3 characters."],
    maxLength: [30, "Last name cannot exceed 30 characters."],
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Strip time component from both dates
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= currentDate; // Chỉ chấp nhận ngày từ hiện tại trở đi
      },
      message: "Ngày đặt chỗ phải từ ngày hiện tại trở đi."
    }
  },
  time: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Provide a valid email"],
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        if (!/^0/.test(value)) {
          // If the phone number doesn't start with 0
          return false;
        } else if (value.length !== 11) {
          // If the phone number is not 11 digits long
          return false;
        }
        return true;
      },
      message: function(props) {
        if (!/^0/.test(props.value)) {
          return "Phone number must start with '0'.";
        } else if (props.value.length !== 11) {
          return "Phone number must be exactly 11 digits long.";
        }
        return "Invalid phone number.";
      }
    }
  },
  guests: {  
    type: Number,
    required: true,
    min: [1, "There must be at least 1 guest."],
  },
  notes: {
    type: String,
    maxLength: [500, "Notes cannot exceed 500 characters."],
  },
});

export const Reservation = mongoose.model("Reservation", reservationSchema);