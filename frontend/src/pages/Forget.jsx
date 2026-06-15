import React from 'react';
import {useState,useEffect} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";


const Forget = () => {
    const navigate=useNavigate();
    const [otpsent,setotpsent]=useState(false);
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const [otp,setotp]=useState("");

    const getotp=async(e)=>{
        e.preventDefault();
        try{
            const res=await axios.post("https://expense-tracker-ce2j.onrender.com/api/v1/sendotp",{email},{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.msg);
                setotpsent(true);
            }
            else{
                toast.error(res.data.msg);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    const resetpass=async(e)=>{
        e.preventDefault();
        try{
            
            const res=await axios.post("https://expense-tracker-ce2j.onrender.com/api/v1/forgetpassword",{email,password,otp},{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.msg);
                setotpsent(false);
                navigate("/");
            }
            else{
                toast.error(res.data.msg);
            }
        }
        catch(err){
            console.log(err);
        }
    }

  return (
    <div className="loginformouter">
        <form className="loginform">
            <h3>Forget Password</h3>

            {otpsent ? (
                <>
                    <input
                        type="email"
                        placeholder="Email"
                        onChange={(e)=>setemail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        onChange={(e)=>setpassword(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Enter OTP"
                        onChange={(e)=>setotp(e.target.value)}
                    />

                    <button onClick={resetpass}>
                        Reset Password
                    </button>
                </>
            ) : (
                <>
                    <input
                        type="email"
                        placeholder="Enter Email"
                        onChange={(e)=>setemail(e.target.value)}
                    />

                    <button onClick={getotp}>
                        Send OTP
                    </button>
                </>
            )}
        </form>
    </div>
  )
}

export default Forget;
