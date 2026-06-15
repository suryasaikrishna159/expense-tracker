import React,{useState,useEffect} from 'react';
import {toast} from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";

const Addexp = () => {
    const [title,settitle]=useState("");
    const [amount,setamount]=useState("");
    const [category,setcategory]=useState("");
    const [date,setdate]=useState("");

    const submithandler=async(e)=>{
        e.preventDefault();
        try{
            const result=await axios.post("http://localhost:5000/api/v1/expenses",{title,amount,category,date},{withCredentials:true});
            if(result.data.success){
                toast.success(result.data.msg);
                settitle("");
                setamount("");
                setcategory("");
                setdate("");
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
        <div className="loginformouter" >
        <form className="loginform" onSubmit={submithandler}>
            <h3>Add New Expense</h3>
            <input type="text" placeholder='Title' onChange={(e)=>settitle(e.target.value)} value={title}/>
            <input type="number" placeholder='Amount' onChange={(e)=>setamount(e.target.value)} value={amount}/>
            <select onChange={(e)=>setcategory(e.target.value)} value={category}>
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
            </select>
            <input type="date" placeholder='Title' onChange={(e)=>setdate(e.target.value)} value={date}/>
            <button type="submit">Add</button>
        </form>
    </div>
    </>
    
  )
}

export default Addexp;