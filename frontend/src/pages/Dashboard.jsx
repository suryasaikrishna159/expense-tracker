import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";


const Dashboard = () => {
    const [total, settotal] = useState("");
    const [category, setcategory] = useState("");
    const [date, setdate] = useState("");
    const [expenses, setexpenses] = useState([]);
    const [insights,setinsights]=useState([]);

    const [editId, setEditId] = useState(null);

    const [editData, setEditData] = useState({
        title: "",
        amount: "",
        category: "",
        date: ""
    });

    const filterhandler = async () => {
        let endpoint = "";

        if (category !== "" && date === "") {
            endpoint += `category=${category}`;
        } else if (category !== "" && date !== "") {
            endpoint += `category=${category}&date=${date}`;
        } else if (category === "" && date !== "") {
            endpoint += `date=${date}`;
        }

        try {
            const result = await axios.get(
                `https://expense-tracker-ce2j.onrender.com/api/v1/expenses?${endpoint}`,
                {
                    withCredentials: true
                }
            );

            if (result.data.success) {
                setexpenses(result.data.expenses);
                settotal(result.data.sum);
            } else {
                toast.error(result.data.msg);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const deleterow = async (id) => {
        try {
            const result = await axios.delete(
                `https://expense-tracker-ce2j.onrender.com/api/v1/expenses/${id}`,
                {
                    withCredentials: true
                }
            );

            if (result.data.success) {
                toast.success(result.data.msg);
                await filterhandler();
            } else {
                toast.error(result.data.msg);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const startEdit = (expense) => {
        setEditId(expense._id);

        setEditData({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date.split("T")[0]
        });
    };

    const saveEdit = async () => {
        try {
            const result = await axios.put(
                `https://expense-tracker-ce2j.onrender.com/api/v1/expenses/${editId}`,
                editData,
                {
                    withCredentials: true
                }
            );

            if (result.data.success) {
                toast.success(result.data.msg);

                setEditId(null);

                await filterhandler();
            } else {
                toast.error(result.data.msg);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const insightshandler=async()=>{
        try{
            const result=await axios.get("https://expense-tracker-ce2j.onrender.com/api/v1/insights",{withCredentials:true});
            
            if(result.data.success){
                setinsights(result.data.insights);
            }
            else{
                toast.error(result.data.msg);
            }
            
        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        filterhandler();
    }, [category, date]);

    useEffect(()=>{
        insightshandler();
    },[total]);

    return (
        <div>
            <Navbar />

            <div className="dashboard">
                <div className="topsection">

                    <div className="totalcard">
                        

                        <h4>Total Expense</h4>

                        <span>₹{total}</span>

                        <small>
                            Based on current filters
                        </small>
                    </div>

                    <div className="insightcard">
                        <h4>Budget Insights</h4>

                        <div className="budinsights">

                            {
                                insights.length > 0 ? (
                                    insights.map((e,index)=>(
                                        !(e.budget===0 && e.spent===0) &&
                                        <div
                                            key={index}
                                            className={`insightitem ${
                                                e.status==="Exceeded"
                                                ? "danger"
                                                : "success"
                                            }`}
                                        >
                                            <div className="insightheader">
                                                <span>{e.category}</span>
                                                <span>{e.percentageUsed}%</span>
                                            </div>

                                            <div className="progressbar">
                                                <div
                                                    className="progressfill"
                                                    style={{
                                                        width:`${
                                                            Math.min(
                                                                e.percentageUsed,
                                                                100
                                                            )
                                                        }%`
                                                    }}
                                                ></div>
                                            </div>

                                            <p>
                                                {
                                                    e.status==="Exceeded"
                                                    ? `Exceeded by ₹${e.amount}`
                                                    : `Saved ₹${e.amount}`
                                                }
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="emptytext">
                                        Set budget to get insights
                                    </p>
                                )
                            }

                        </div>
                    </div>

                </div>
            
                
                <div className="filtercard">
                    <div className="sectiontitle">
                        <h3>Expense Filters</h3>
                        <p>Filter expenses by category and date</p>
                    </div>

                    <div className="filtercontrols">
                        <select
                            onChange={(e) => setcategory(e.target.value)}
                            value={category}
                        >
                            <option value="">Category</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Bills">Bills</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Other">Other</option>
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setdate(e.target.value)}
                        />
                    </div>
                    
                </div>

                <div className="expensecontainer">
                    <div className="tableheader">
                        <div>
                            <h3>Expense History</h3>
                            <p>
                                Manage and review all transactions
                            </p>
                        </div>

                    </div>

                    {expenses.map((e) => (
                        <div className="row" key={e._id}>
                            {editId === e._id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(ev) =>
                                            setEditData({
                                                ...editData,
                                                title: ev.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="number"
                                        value={editData.amount}
                                        onChange={(ev) =>
                                            setEditData({
                                                ...editData,
                                                amount: ev.target.value
                                            })
                                        }
                                    />

                                    <select
                                        value={editData.category}
                                        onChange={(ev) =>
                                            setEditData({
                                                ...editData,
                                                category: ev.target.value
                                            })
                                        }
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Health">Health</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>

                                    <input
                                        type="date"
                                        value={editData.date}
                                        onChange={(ev) =>
                                            setEditData({
                                                ...editData,
                                                date: ev.target.value
                                            })
                                        }
                                    />

                                    <button onClick={saveEdit}>
                                        Save
                                    </button>

                                    <button
                                        onClick={() => setEditId(null)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>{e.title}</p>
                                    <p>₹{e.amount}</p>
                                    <p>{e.category}</p>

                                    <p>
                                        {new Date(
                                            e.date
                                        ).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={() => startEdit(e)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleterow(e._id)}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
