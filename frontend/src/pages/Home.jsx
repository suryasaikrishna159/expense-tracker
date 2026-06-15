import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="outer">
            <div className="hero">

                <p className="tagline">
                    PERSONAL FINANCE • ANALYTICS • REPORTS
                </p>

                <h1>
                    Take Control of Your
                    <span> Expenses</span>
                </h1>

                <p className="description">
                    Track spending, analyze trends, generate monthly reports,
                    and build smarter financial habits with a clean and modern
                    expense management platform.
                </p>

                <div className="heroactions">
                    <button onClick={() => navigate("/login")}>
                        Get Started
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default Home;