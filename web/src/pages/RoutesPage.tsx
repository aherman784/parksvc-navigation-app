import "../styles/RoutesPage.css";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

interface RouteFile {
  fileName: string;
  shortFileName: string;
  uploadDate: string;
  numPoints: number;
}

const RoutesPage = () => {
  const [routeFiles, setRouteFiles] = useState<RouteFile[]>([]);
  const [sortMethod, setSortMethod] = useState("asc");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current!.click();
  };

  // Get JSON files from routes_placeholders
  // TODO: Replace with S3 fetch
  const loadRouteFiles = () => {
    const context = (require as any).context("../routes_placeholders", false, /\.json$/);
    const files = context.keys().map((key: string) => {
      const fileName = key.replace("./", "");

      const uploadDateMatch = fileName.match(/results_(\d{4}-\d{2}-\d{2})/);
      const uploadDate = uploadDateMatch?.[1] || "Unknown";

      const shortFileNameMatch = fileName.match(/^(.*)_results_/);
      const shortFileName = shortFileNameMatch?.[1].replaceAll("_", " ") || "Unknown";

      const fileContent = context(key);
      const numPoints = getPathNodes(fileContent);

      return {
        fileName,
        shortFileName,
        uploadDate,
        numPoints,
      };
    });
    return files;
  };

  const fetchRouteData = async () => {
    try {
      const content: RouteFile[] = loadRouteFiles();
      setRouteFiles(content);
    } catch (error) {
      console.error("Error fetching route data:", error);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  const getPathNodes = (json: any): number[][] => {
    if (json && json.final_route && Array.isArray(json.final_route)) {
      return json.final_route.map((point: number[]) => [point[0], point[1]]).length;
    } else {
      return [];
    }
  };

  const sortRouteFiles = (files: RouteFile[], method: string) => {
    return files.sort((a, b) => {
      const dateA = new Date(a.uploadDate);
      const dateB = new Date(b.uploadDate);
      
      if (method === "date_asc") {
        return dateA.getTime() - dateB.getTime();
      } else if (method === "date_desc") {
        return dateB.getTime() - dateA.getTime();
      } else if (method === "numPoints_asc") {
        return a.numPoints - b.numPoints;
      } else if (method === "numPoints_desc") {
        return b.numPoints - a.numPoints;
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
            <option value="date_desc">Newest to Oldest</option>
            <option value="date_asc">Oldest to Newest</option>
            <option value="numPoints_desc">Points: High to Low</option>
            <option value="numPoints_asc">Points: Low to High</option>
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
              <div className="route-name">{route.shortFileName}</div>
              <div className="route-upload-date">
                Upload Date: {route.uploadDate}
              </div>
              <div className="route-file-size">Total Points: {route.numPoints}</div>
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
