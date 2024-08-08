import '../../styles/Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="images/park-svc-logo.png" alt="Park Service Logo" />
      </div>
      <nav className="nav-links">
        <ul>
          <li><Link to="/routes">Routes</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
