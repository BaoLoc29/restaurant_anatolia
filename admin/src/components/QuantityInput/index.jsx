import React from "react";
import { Input } from "antd";

const QuantityInput = ({ value, onChange }) => {
  const handleInputChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    onChange(newQuantity);
  };

  return (
    <Input
      type="number"
      value={value}
      onChange={handleInputChange}
      className="w-14"
    />
  );
};

export default QuantityInput;
