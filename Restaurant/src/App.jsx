import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Home from './Pages/Home'
import NotFound from "./Pages/NotFound";
import Success from "./Pages/Success";
import Confirm from "./Pages/Confrim/Confrim";
import './App.css'

const App = () => {
  return <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/success" element={<Success/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
      <Toaster/>
    </Router>;
};

export default App