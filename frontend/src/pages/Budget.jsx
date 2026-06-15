import React,{useState,useEffect} from 'react';
import axios from "axios";
import {toast} from "react-toastify";
import Navbar from "../components/Navbar"

const Budget = () => {
    const [selmon,setselmon]=useState("");
    const [food,setfood]=useState(0);
    const [transport,settransport]=useState(0);
    const [shopping,setshopping]=useState(0);
    const [Bills,setBills]=useState(0);
    const [Entertainment,setEntertainment]=useState(0);
    const [Health,setHealth]=useState(0);
    const [Education,setEducation]=useState(0);
    const [Other,setOther]=useState(0);

    const [year, month] = selmon.split("-");

    const submithandler=async(e)=>{
        e.preventDefault();
        try{
            const result=await axios.put("http://localhost:5000/api/v1/setbudget",{month,year,Food:food,Transport:transport,Shopping:shopping,Bills,Entertainment,Health,Education,Other},{withCredentials:true});
            if(result.data.success){
                toast.success(result.data.msg);
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
    <Navbar/>
    <div className="loginformouter">
        
        <form className="loginform" onSubmit={submithandler}>
            <h3>budget</h3>
            <input type="month" onChange={(e)=>setselmon(e.target.value)}/>
            <input type="number" placeholder='Food budget' onChange={(e)=>setfood(e.target.value)}/>
            <input type="number" placeholder='Transport budget' onChange={(e)=>settransport(e.target.value)}/>
            <input type="number" placeholder='Shopping budget' onChange={(e)=>setshopping(e.target.value)}/>
            <input type="number" placeholder='Bills budget' onChange={(e)=>setBills(e.target.value)}/>
            <input type="number" placeholder='Entertainment budget' onChange={(e)=>setEntertainment(e.target.value)}/>
            <input type="number" placeholder='Health budget' onChange={(e)=>setHealth(e.target.value)}/>
            <input type="number" placeholder='Education budget' onChange={(e)=>setEducation(e.target.value)}/>
            <input type="number" placeholder='Other budget' onChange={(e)=>setOther(e.target.value)}/>
            <button type="submit">set budget</button>
        </form>
    </div>
    </>
    
  )
}

export default Budget;