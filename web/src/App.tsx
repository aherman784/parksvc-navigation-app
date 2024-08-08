import "./styles/App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import RoutesPage from "./pages/RoutesPage";
import Sidebar from "./components/common/Sidebar";
import ViewRoute from "./pages/ViewRoute";

const App = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/routes" />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:fileName" element={<ViewRoute />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
