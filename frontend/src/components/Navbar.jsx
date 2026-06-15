import React from 'react';
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import axios from "axios";

const Navbar = () => {
    const navigate=useNavigate();
    const logouthandler=async(e)=>{
        e.preventDefault();

        try{
            const result=await axios.post("https://expense-tracker-ce2j.onrender.com/api/v1/logout",{},{withCredentials:true});

            if(result.data.success){
                toast.success(result.data.msg);
                navigate("/");
            }
            else{
                toast.error(result.data.msg);
            }
        }
        catch(err){
            console.log(err);
        }
        
    }
  return (
    <>
      <div className="header">
        <h2 onClick={()=>navigate("/dashboard")}>My Expenses</h2>
        <div className="navlinks">
          <h3 onClick={()=>navigate("/dashboard")}>DashBoard</h3>
          <h3 onClick={()=>navigate("/addexp")}>Add Expense</h3>
          <h3 onClick={()=>navigate("/budget")}>Set Budget</h3>
          <h3 onClick={()=>navigate("/monthlyreport")}>Monthly report</h3>
          <h3 onClick={()=>navigate("/ai")}>Ai assistant</h3>
        </div>
        
        <button onClick={logouthandler}>Logout</button>
      </div>
    </>
  )
}

export default Navbar;
