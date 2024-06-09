import React from "react";
import { Link } from "react-router-dom";

const Orders = () => {
  return (
    <div className="h-screen">
      This is Orders{" "}
      <Link to="/" className="underline">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Orders;
