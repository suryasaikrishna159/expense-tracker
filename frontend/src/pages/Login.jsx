import React from 'react';
import {useState,useEffect} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [state,setstate]=useState("signup");

    const [name,setname]=useState("");
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");

    const navigate=useNavigate();

    const submithandler=async(e)=>{
        e.preventDefault();
        let endpoint= state==="signup"? "register":"login";
        let payload= state==="signup"?{name,email,password}:{email,password};
        
        try{
            const res=await axios.post(`https://expense-tracker-ce2j.onrender.com/api/v1/${endpoint}`,payload,{withCredentials:true});
            if(res.data.success){
                toast.success(res.data.msg);
                state==="signup"?navigate("/"):navigate("/dashboard");
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

        <form onSubmit={submithandler} className="loginform">

            <h3>
                {state==="signup"?"signup":"login"}
            </h3>

            {state==="signup" && (
                <input
                    type="text"
                    value={name}
                    onChange={(e)=>setname(e.target.value)}
                    placeholder="Name"
                />
            )}

            <input
                type="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                placeholder="Email"
            />

            <input
                type="password"
                value={password}
                onChange={(e)=>setpassword(e.target.value)}
                placeholder="Password"
            />

            <button type="submit">
                {state==="signup" ? "Register" : "Login"}
            </button>
            <p onClick={() => setstate(state==="signup" ? "login" : "signup")}  className="loginmsg">
                {   state==="signup"
                    ? "Already have an account? Login"
                    : "Don't have an account? Signup"
                }
            </p>

            {state==="login" && <p className="loginmsg" onClick={()=>navigate("/forget")}>forget password?</p>}
        </form>

    </div>
  )
}
export default Login;
