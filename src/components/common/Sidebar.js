import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="images/park-svc-logo.png" alt="Park Service Logo" />
      </div>
      <nav className="nav-links">
        <ul>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/routes">Routes</Link></li>
          <li><Link to="/navigation">Navigation</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
