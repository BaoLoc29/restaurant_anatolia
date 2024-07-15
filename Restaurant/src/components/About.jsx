import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi";

const About = () => {
  return (
    <>
      <section className="about" id="about">
        <div className="container">
          <div className="banner">
            <div className="top">
              <h1 className="heading">ABOUT US</h1>
              <p>Những món ăn tinh tế và sáng tạo.</p>
            </div>
            <p className="mid">
              Chào mừng đến với nhà hàng Anatolia – điểm đến lý tưởng cho những
              ai yêu thích ẩm thực tinh tế và phong cách phục vụ chuyên nghiệp.
              Tại Anatolia, chúng tôi tự hào mang đến cho thực khách những món
              ăn ngon miệng được chế biến từ những nguyên liệu tươi ngon, dưới
              bàn tay tài hoa của các đầu bếp giàu kinh nghiệm. Không gian nhà
              hàng sang trọng, ấm cúng cùng với dịch vụ chu đáo chắc chắn sẽ
              mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời và đáng
              nhớ. Anatolia – nơi hội tụ của hương vị và sự sáng tạo.
            </p>
            <Link to={"/Menu-all"}>
              Khám phá Menu{" "}
              <span>
                <HiOutlineArrowRight />
              </span>
            </Link>
          </div>
          <div className="banner">
            <img src="about.png" alt="about" />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
