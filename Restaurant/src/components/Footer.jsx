import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="banner">
          <div className="left">
            <img src="/logo_image.png" alt="" width="180" />
          </div>
          <div className="right">
            <p> HO CHI MINH, VIETNAM</p>
            <p>Open: 08:00 AM - 11:00 PM</p>
          </div>
        </div>
        <div className="banner">
          <div className="left">
            <p>Developed By Huy and An</p>
          </div>
          <div className="right">
            <p>All Rights Reserved By Huy and An.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
