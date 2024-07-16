import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";
import Success from "./Pages/Success/Success";
import Confirm from "./Pages/Confrim/Confrim";
import PaymentCancel from "./Pages/PaymentCancel";
import Menu_res from "./Pages/Menu_res/index.jsx";
import Menu_all from "./Pages/Menu_res/menu_all.jsx";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/menu-res" element={<Menu_res />} />
        <Route path="/menu-all" element={<Menu_all />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
