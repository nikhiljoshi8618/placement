import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [isMenuActive, setIsMenuActive] = useState(false); // State to toggle menu
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive); // Toggle the menu visibility
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">Placement Portal</h2>
        {/* Hamburger icon */}
        <div className={`navbar-toggle ${isMenuActive ? "active" : ""}`} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {/* Navbar Links */}
        <div className={`nav-links ${isMenuActive ? "active" : ""}`}>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/placementprediction")}>Placement Prediction</button>
          <button onClick={() => navigate("/Assessment")}>Assessment</button>
          <button onClick={() => navigate("/courses")}>Courses</button>
          <button onClick={() => navigate("/upcoming-placements")}>Upcoming Placements</button>
          <button onClick={() => navigate("/interview")}>Interview Assistant</button>
          <button onClick={() => navigate("/feedback")}>Share Experiences</button> {/* New Button */}
        </div>
      </nav>

      {/* Dashboard Feature Cards */}
      <h1>Welcome to Placement Portal</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate("/placementprediction")}>
          <h3>Placement Prediction</h3>
          <p>Check your eligibility based on your skills and resume.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/Assessment")}>
          <h3>Assessment</h3>
          <p>Take assessments to evaluate your skills.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/courses")}>
          <h3>Courses</h3>
          <p>Find courses to improve your skills.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/upcoming-placements")}>
          <h3>Upcoming Placements</h3>
          <p>Check upcoming placement opportunities.</p>
        </div>

        <div className="interview-card" onClick={() => navigate("/interview")}>
          <h3>Interview Assistant</h3>
          <p>Check your communication and interview cracking skills.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/feedback")}> {/* Optional Card */}
          <h3>Share Experiences</h3>
          <p>Help juniors by sharing your placement journey and interview tips.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
