import React from 'react';
import {useState,useEffect} from "react";
import {Routes,Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Forget from "./pages/Forget";
import Dashboard from "./pages/Dashboard";
import Addexp from "./pages/Addexp";
import Monthlyreport from "./pages/Monthlyreport";
import Budget from "./pages/Budget";
import Ai from "./pages/Ai";
import {ToastContainer} from "react-toastify";


const App = () => {
  return (
    <>
        <ToastContainer/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/forget" element={<Forget/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/addexp" element={<Addexp/>} />
          <Route path="/monthlyreport" element={<Monthlyreport/>}/>
          <Route path="/budget" element={<Budget/>} />
          <Route path="/ai" element={<Ai/>} />
        </Routes>
      
        
    </>
  )
}

export default App;