import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Monthlyreport = () => {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [report, setReport] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [visibile,setvisibile]=useState(0);
    const [name,setname]=useState("");

    const fetchReport = async (e) => {
        e.preventDefault();
        setvisibile(1);

        if (!selectedMonth) {
            return toast.error("Select a month");
        }

        const [year, month] = selectedMonth.split("-");

        try {
            const result = await axios.get(
                `https://expense-tracker-ce2j.onrender.com/api/v1/monthlyreport?month=${month}&year=${year}`,
                {
                    withCredentials: true
                }
            );

            if (result.data.success) {
                setReport(result.data.report);
                setGrandTotal(result.data.grandTotal);
                setname(result.data.name);
            } else {
                toast.error(result.data.msg);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(`${name}'s Monthly Expense Report`, 14, 20);

        doc.setFontSize(14);
        doc.text(`Month: ${selectedMonth}`, 14, 32);

        autoTable(doc, {
            startY: 45,
            head: [["Category", "Amount"]],
            body: report.map((item) => [
                item._id,
                `Rs. ${item.total}`
            ])
        });

        doc.setFontSize(14);

        doc.text(
            `Grand Total: Rs. ${grandTotal}`,
            14,
            doc.lastAutoTable.finalY + 15
        );

        doc.save(`${selectedMonth}-expense-report.pdf`);
    };

    return (
        <>
        <Navbar />
        <div className="reportcontainer">
            
            <div className="reportcard">

                <h2>Monthly Report</h2>

                <div className="reportcontrols">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />

                    <button onClick={fetchReport}>
                        Generate Report
                    </button>
                    {visibile==1 && <button onClick={downloadPDF}>
                                    Download PDF
                                </button>}
                </div>

                {visibile === 1 && (
                    <div className="reporttotal">
                        <h3>
                            Total Expense:
                            <span> ₹{grandTotal}</span>
                        </h3>
                        
                    </div>
                )}

                {report.length > 0 ? (
                    <div className="reportlist">

                        <div className="reportrow">
                            <p>Category</p>
                            <p>Total</p>
                        </div>

                        {report.map((item) => (
                            <div
                                className="reportrow"
                                key={item._id}
                            >
                                <p>{item._id}</p>

                                <p className="reportamount">
                                    ₹{item.total}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    visibile === 1 &&
                    <div className="nodata">
                        No expenses found for this month
                    </div>
                )}

            </div>
        </div>
        </>
        
    );
};

export default Monthlyreport;
