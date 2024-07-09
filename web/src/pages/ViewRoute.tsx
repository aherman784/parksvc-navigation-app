import "./ViewRoute.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RouteMap from "../components/maps/RouteMap";
import { Link } from "react-router-dom";

const ViewRoute = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const [shortFileName, setShortFileName] = useState<string>("Unknown");
  const [routeNodes, setRouteNodes] = useState<number[][] | null>(null);
  const [withinParkNodes, setWithinParkNodes] = useState<number[][] | null>(
    null
  );
  const [numNodes, setNumNodes] = useState<number>(0);
  const [totalLength, setTotalLength] = useState<number>(0);

  useEffect(() => {
    const initializeRouteData = async (fileName: string) => {
      try {
        // TODO: Replace with S3 import
        const routeDataJSON = await import(
          `../routes_placeholders/${fileName}`
        );
        const { finalRouteNodes, withinParkNodes } =
          getPathNodes(routeDataJSON);
        setRouteNodes(finalRouteNodes);
        setWithinParkNodes(withinParkNodes);
        setNumNodes(finalRouteNodes.length);

        const lengthInMiles = getTotalLengthInMiles(routeDataJSON);
        setTotalLength(lengthInMiles);

        const shortFileNameMatch = fileName.match(/^(.*)_results_/);
        const shortFileName =
          shortFileNameMatch?.[1].replaceAll("_", " ") || "Unknown";
        setShortFileName(shortFileName);
      } catch (error) {
        console.error("Error loading route data:", error);
      }
    };

    if (fileName) {
      initializeRouteData(fileName);
    }
  }, [fileName]);

  const getPathNodes = (
    json: any
  ): { finalRouteNodes: number[][]; withinParkNodes: number[][] } => {
    const DUMP_COORDS = [41.381526, -96.253521];
    const SHOP_COORDS = [41.225876, -96.143424];

    let finalRouteNodes: number[][] = [];
    let withinParkNodes: number[][] = [];

    if (json.final_route) {
      finalRouteNodes = Object.values(json.final_route);
    }

    if (json.within_park_routes) {
      withinParkNodes = Object.values(json.within_park_routes);
    }
    withinParkNodes.reverse();
    withinParkNodes.unshift(SHOP_COORDS);
    withinParkNodes.push(DUMP_COORDS);

    return { finalRouteNodes, withinParkNodes };
  };

  // TODO: Implement logic to calculate total length in miles
  // Check if needed
  const getTotalLengthInMiles = (json: any): number => {
    return 100;
  };

  return (
    <div className="view-route-container">
      <h1>{shortFileName}</h1>
      <p>Total Nodes: {numNodes}</p>
      {/* <p>Total Length: {totalLength.toFixed(2)} miles</p> */}
      {routeNodes && withinParkNodes && (
        <RouteMap finalPoints={routeNodes} parkPoints={withinParkNodes} />
      )}
      <Link to={`/navigation/${fileName}`}>
        <button className="upload-button">Drive</button>
      </Link>
    </div>
  );
};

export default ViewRoute;
