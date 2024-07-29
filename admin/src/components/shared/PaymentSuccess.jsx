import React from "react";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Rate, Button } from "antd";

const customIcons = {
  1: <FrownOutlined className="text-3xl" />,
  2: <FrownOutlined className="text-3xl" />,
  3: <MehOutlined className="text-3xl" />,
  4: <SmileOutlined className="text-3xl" />,
  5: <SmileOutlined className="text-3xl" />,
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-red-200 via-red-100 to-red-200">
      <div className="relative mx-4 text-center shadow-2xl p-10 bg-white rounded-xl max-w-4xl w-full">
        <img
          src="/logo_image.png"
          alt="logo"
          className="mx-auto mb-8"
          width={200}
        />
        <p className="text-3xl font-semibold text-gray-800 mt-6">
          Cảm ơn quý khách đã tin tưởng và lựa chọn Anatolia
        </p>
        <p className="text-2xl text-gray-600 mt-4">
          Hẹn gặp lại quý khách trong tương lai gần nhất!
        </p>
        <p className="text-xl text-gray-600 mt-4">
          Chúng tôi rất vui khi bạn đánh giá về trải nghiệm tại nhà hàng!
        </p>
        <div className="mt-8">
          <Rate
            defaultValue={5}
            character={({ index = 0 }) => customIcons[index + 1]}
          />
        </div>
        <Button size="large" className="mt-8" onClick={() => navigate("/")}>
          Quay về Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
