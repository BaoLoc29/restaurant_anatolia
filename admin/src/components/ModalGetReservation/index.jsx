import { Empty, Modal, Pagination } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { getPagingOrderFood } from "../../services/orderFood.js";

const ModalGetReservation = ({
  title,
  isModalOpen,
  handleCancel,
  handleSelectTable,
  selectedTable,
}) => {
  const [loading, setLoading] = useState(false);
  const [orderFood, setOrderFood] = useState([]);
  const [pageSize, setPageSize] = useState(12);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoc, setTotalDoc] = useState(0);

  const getOrderFood = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPagingOrderFood({ pageSize, pageIndex });
      setOrderFood(result.data.orders);
      setTotalPages(result.data.totalPages);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getOrderFood();
  }, [getOrderFood]);

  const handlePaginationChange = (pageIndex, pageSize) => {
    setPageSize(pageSize);
    setPageIndex(pageIndex);
  };

  const handleRadioChange = (event, orders) => {
    handleSelectTable(orders.reservationId);
  };

  return (
    <Modal
      title={<div className="text-center text-xl font-bold mb-5">{title}</div>}
      loading={loading}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={680}
    >
      <div>
        <div className="flex flex-wrap gap-4 w-30">
          {orderFood.length > 0 ? (
            orderFood.map((orders) => (
              <div key={orders.reservationId}>
                <label className="custom-radio-label">
                  <input
                    type="radio"
                    className="hidden"
                    name="selectedTable"
                    onChange={(event) => handleRadioChange(event, orders)}
                    checked={selectedTable === orders?.tableId}
                  />
                  <div
                    className={`w-[9rem] border rounded-lg p-4 cursor-pointer hover:shadow-md ${orders.dishes && orders.dishes.length > 0 ? "bg-blue-300" : "bg-gray-100"}`}
                  >
                    <div className="font-bold mb-2">
                      {orders.dishes && orders.dishes.length > 0 ? (
                        <span>{orders.status}</span>
                      ) : (
                        <span>Chưa chọn món</span>
                      )}
                    </div>
                    <hr />
                    <div className="text-gray-600 mt-2 text-center text-lg">
                      {orders.tableId}
                    </div>
                  </div>
                </label>
              </div>
            ))
          ) : (
            <div className="mx-auto">
              <Empty />
            </div>
          )}
        </div>

        <Pagination
          className="w-full flex justify-end mt-5"
          defaultCurrent={1}
          current={pageIndex}
          total={totalDoc}
          totalPages={totalPages}
          pageSize={pageSize}
          showSizeChanger
          onChange={handlePaginationChange}
        />
      </div>
    </Modal>
  );
};

export default ModalGetReservation;
