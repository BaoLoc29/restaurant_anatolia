import React from "react";
import About from "../components/About.jsx";
import HeroSection from "../components/HeroSection.jsx";
import Menu from "../components/Menu.jsx";
import WhoAreWe from "./../components/WhoAreWe";
import Team from "../components/Team.jsx";
import Reservation from "../components/Reservation.jsx";
import Footer from "../components/Footer.jsx";
import Qualities from "./../components/Quanlities";
import RestaurantCardList from "../components/R_C_List/index.jsx";

const Home = () => {
  return (
    <>
      <HeroSection />
      <About />
      <Qualities />
      <Menu />
      <WhoAreWe />
      <Team />
      <section id="reservation">
        <Reservation />
      </section>
      <RestaurantCardList />
      <Footer />
    </>
  );
};

export default Home;
