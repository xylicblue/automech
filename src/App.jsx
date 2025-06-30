import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard";
import ServicesPage from "./services";
import BackgroundWrapper from "./background";
import NavBar from "./navbar";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/services" element={<ServicesPage />}></Route>
      </Routes>
    </>
  );
}
export default App;
