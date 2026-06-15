import React,{useState,useEffect} from 'react';
import axios from "axios";
import {toast} from "react-toastify";
import Navbar from '../components/Navbar';

const Ai = () => {
    const [query,setquery]=useState("");
    const [ans,setans]=useState("");
    const [loading, setLoading] = useState(false);
    const [history,sethistory]=useState([]);
    const sendq=async()=>{
        try{
            setLoading(true);
            if(query===""){
                return toast.error("missing query");
            }
            const res=await axios.post("https://expense-tracker-ce2j.onrender.com/api/v1/ai",{query},{withCredentials:true});
            if(res.data.success){
                setLoading(false);
                setans(res.data.answer);
                historyhandler();
            }
            else{
                setLoading(false);
                toast.warning("High traffic. Try after sometime");
            }
        }
        catch(err){
            console.log(err);
        }
        
    }

    const historyhandler=async()=>{
        try{
            const result=await axios.get("https://expense-tracker-ce2j.onrender.com/api/v1/getchats",{withCredentials:true});
            if(result.data.success){
                sethistory(result.data.chats);
            }
            
        }
        catch(err){
            console.log(err);
        }
        

    }

    useEffect(()=>{
        historyhandler();
    },[])
  return (
    <div>
        <Navbar />
        <div className="ailayout">
        <div className='historycontainer'>
            <h3>history</h3>
            {
                history.map((e)=>(
                    
                        <div key={e._id} 
                            className="historyitem"
                            onClick={()=>{
                                setquery(e.query);
                                setans(e.answer)
                                }
                            }
                        >
                            {e.title}
                        </div>
                    
                ))
            }
        </div>

        <div className="aicontainer">
        <div className="aicard">
            <h2>AI Expense Assistant</h2>
            <p>Ask anything about your expenses</p>

            <div className="aiinputsection">
            <input
                type="text"
                placeholder="How can I help you?"
                value={query}
                onChange={(e) => setquery(e.target.value)}
            />

            {query &&
                <button onClick={sendq} disabled={loading}>
                    {loading?"thinking...":"send"}
                </button>
            }
            
            </div>

            {loading && (
                <div className="ailoader">
                    AI is analyzing your expenses...
                </div>
            )}

            {ans && (
            <div className="airesponse">
                <h4>Response</h4>
                <p>{ans}</p>
            </div>
            )}
        </div>
        </div>
        </div>
    </div>
    );
}

export default Ai;
