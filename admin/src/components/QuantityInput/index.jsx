import React, { useState } from "react";
import { Input } from "antd";

const QuantityInput = ({ value, onChange }) => {
  const [quantity, setQuantity] = useState(value);

  const handleInputChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
    onChange(newQuantity);
  };

  return (
    <Input
      type="number"
      value={quantity}
      onChange={handleInputChange}
      className="w-16 text-center"
    />
  );
};

export default QuantityInput;
