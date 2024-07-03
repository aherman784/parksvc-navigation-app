import { useEffect, useState, useRef } from "react";
import "./RoutesPage.css";
import { Link } from "react-router-dom";

interface RouteFile {
  fileName: string;
  uploadDate: string;
  fileSize: string;
}

const RoutesPage = () => {
  const [routeFiles, setRouteFiles] = useState<RouteFile[]>([]);
  const [sortMethod, setSortMethod] = useState("asc");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current!.click();
  };

  // TODO: Implement file upload from AWS S3
  // Get route from placeholder for testing
  const fetchRouteData = async () => {
    try {
      const content: RouteFile[] = [
        {
          fileName: "Many_Park_Path_results_2024-07-01_14-33-19.json",
          uploadDate: "2.5 MB",
          fileSize: "2024-07-01",
        },
        {
          fileName: "Short Trash Path",
          uploadDate: "2024-07-04",
          fileSize: "1.2 MB",
        },
        {
          fileName: "Whole Route Path",
          uploadDate: "2024-08-22",
          fileSize: "5.0 MB",
        },
      ];

      setRouteFiles(content);
    } catch (error) {
      console.error("Error fetching route data:", error);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  const sortRouteFiles = (files: RouteFile[], method: string) => {
    return files.sort((a, b) => {
      const dateA = new Date(a.uploadDate);
      const dateB = new Date(b.uploadDate);
      if (method === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  };

  useEffect(() => {
    setRouteFiles((prevFiles) => sortRouteFiles([...prevFiles], sortMethod));
  }, [sortMethod]);

  return (
    <div className="routes-container">
      <h1>Routes Page</h1>
      <div className="header-controls">
        <button className="upload-button" onClick={handleUploadClick}>
          Upload File
        </button>
        <div className="sort-dropdown">
          <label htmlFor="sortMethod">Sort by:</label>
          <select
            id="sortMethod"
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
          >
            <option value="asc">Upload Date (Ascending)</option>
            <option value="desc">Upload Date (Descending)</option>
          </select>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".kml,.kmz"
      />
      <div className="route-list">
        {routeFiles.map((route, index) => (
          <div key={index} className="route-item">
            <div className="route-details">
              <div className="route-name">{route.fileName}</div>
              <div className="route-upload-date">
                Upload Date: {route.uploadDate}
              </div>
              <div className="route-file-size">File Size: {route.fileSize}</div>
            </div>
            <Link to={`/routes/${route.fileName}`}>
              <button className="view-route-button">View Route</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesPage;
