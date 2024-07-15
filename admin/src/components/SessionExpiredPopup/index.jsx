import React from "react";
import { Modal, Button, Result } from "antd";

const SessionExpiredPopup = ({ visible, onClose }) => {
  return (
    <Modal
      className="p-0"
      visible={visible}
      footer={null}
      onCancel={onClose}
      width={600}
    >
      <Result
        status="warning"
        title="Phiên đăng nhập hết hạn!"
        subTitle={
          <span className="text-lg">
            Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.
          </span>
        }
        extra={
          <Button key="login" size="large" type="primary" onClick={onClose}>
            Đăng nhập lại
          </Button>
        }
      />
    </Modal>
  );
};

export default SessionExpiredPopup;
