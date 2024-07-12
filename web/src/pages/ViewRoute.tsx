import "./ViewRoute.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RouteMap from "../components/maps/RouteMap";
import { Link } from "react-router-dom";

const ViewRoute = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const [shortFileName, setShortFileName] = useState<string>("Unknown");
  const [routeNodes, setRouteNodes] = useState<number[][] | null>(null);
  const [withinParkNodes, setWithinParkNodes] = useState<number[][][] | null>(
    null
  );
  const [numNodes, setNumNodes] = useState<number>(0);
  // TODO: Remove if not used
  const [totalLength, setTotalLength] = useState<number>(0);

  useEffect(() => {
    const initializeRouteData = async (fileName: string) => {
      try {
        // Load route data from placeholder (replace with S3 fetch as needed)
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

        // Extract short file name for display
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
  ): { finalRouteNodes: number[][]; withinParkNodes: number[][][] } => {
    const DUMP_COORDS = [41.381526, -96.253521];
    const SHOP_COORDS = [41.225876, -96.143424];

    let finalRouteNodes: number[][] = [];
    let withinParkNodes: number[][][] = [];

    if (json.final_route) {
      finalRouteNodes = json.final_route;
    }

    if (json.within_park_routes) {
      withinParkNodes = Object.values(json.within_park_routes);
    }

    withinParkNodes.unshift([SHOP_COORDS]);
    withinParkNodes.push([DUMP_COORDS]);

    return { finalRouteNodes, withinParkNodes };
  };

  const getTotalLengthInMiles = (json: any): number => {
    // TODO: Placeholder function to calculate total length if needed
    return 100;
  };

  return (
    <div className="view-route-container">
      <h1>{shortFileName}</h1>
      <p>Total Nodes: {numNodes}</p>
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
