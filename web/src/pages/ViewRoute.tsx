import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RouteMap from "../components/maps/RouteMap";
import "./ViewRoute.css";

// Import the JSON file directly
import routeDataJSON from "../routes_placeholders/Many_Park_Path_results_2024-07-01_14-33-19.json";

const ViewRoute = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const [routeNodes, setRouteNodes] = useState<number[][] | null>(null);
  const [numNodes, setNumNodes] = useState<number>(0);
  const [totalLength, setTotalLength] = useState<number>(0);

  useEffect(() => {
    const initializeRouteData = () => {
      const nodes = getPathNodes(routeDataJSON);
      setRouteNodes(nodes);
      setNumNodes(nodes.length);
      const lengthInMiles = getTotalLengthInMiles(routeDataJSON);
      setTotalLength(lengthInMiles);
    };

    initializeRouteData();
  }, []);

  const getPathNodes = (json: any): number[][] => {
    if (json && json.final_route && Array.isArray(json.final_route)) {
      return json.final_route.map((point: number[]) => [point[0], point[1]]);
    } else {
      return [];
    }
  };

  // TODO: Implement logic to calculate total length in miles
  // Check if needed
  const getTotalLengthInMiles = (json: any): number => {
    return 100;
  };

  return (
    <div className="view-route-container">
      <h1>{fileName}</h1>
      <p>Total Nodes: {numNodes}</p>
      <p>Total Length: {totalLength.toFixed(2)} miles</p>
      {routeNodes && <RouteMap points={routeNodes} />}
    </div>
  );
};

export default ViewRoute;
