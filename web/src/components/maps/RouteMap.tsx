import mapboxgl from "mapbox-gl";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox";
import Map, { useControl, NavigationControl } from "react-map-gl";
import { ScatterplotLayer, PathLayer } from "@deck.gl/layers";
import { useEffect, useState } from "react";

// Setup MapboxGL
// @ts-ignore
mapboxgl.workerClass =
// eslint-disable-next-line
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

// Container component for the route overlay
function DeckGLOverlay(props: MapboxOverlayProps & { interleaved?: boolean }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function chunkArray(array: any[], size: number) {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}

// Generate a unique color for each driving route
function getColor(index: number) {
  const colors = [
    [255, 0, 0, 200],     // Red
    [0, 255, 0, 200],     // Green
    [0, 0, 255, 200],     // Blue
    [255, 255, 0, 200],   // Yellow
    [0, 255, 255, 200],   // Cyan
    [255, 0, 255, 200],   // Magenta
    [255, 165, 0, 200],   // Orange
    [128, 0, 128, 200]    // Purple
  ];
  return colors[index % colors.length];
}

export default function RouteMap({ finalPoints, parkPoints }: { finalPoints: number[][], parkPoints: any[][] }) {
  const [drivingRoutes, setDrivingRoutes] = useState<any[]>([]);
  const [walkingRouteData, setWalkingRouteData] = useState<{ [key: string]: any }>({});
  console.log('Final points:', finalPoints);
  console.log('Park points:', parkPoints);

  useEffect(() => {
    const fetchRoutes = async () => {
      const walkingRoutes: any = {};
      const drivingRoutesPromises: Promise<any>[] = [];

      // Add initial driving point
      let lastDrivingPoint = finalPoints[0];

      // Iterate through park points
      for (const park of parkPoints) {
        if (Array.isArray(park[0])) {
          // Park points are an array of arrays
          const parkStart = park[0];
          const parkEnd = park[park.length - 1];

          // Fetch driving route from last driving point to park start
          drivingRoutesPromises.push(fetchDrivingRoute(lastDrivingPoint, parkStart));

          // Update last driving point to park end
          lastDrivingPoint = parkEnd;

          // Create chunks of park points for walking routes
          const parkChunks = chunkArray(park, 25);
          for (const chunk of parkChunks) {
            const walkingCoordinates = chunk.map(point => `${point[1]},${point[0]}`).join(';');
            if (chunk.length > 1) { // Ensure at least two coordinates
              const walkingUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${walkingCoordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
              const walkingResponse = await fetch(walkingUrl);
              const walkingData = await walkingResponse.json();
              const parkKey = `${parkStart[1]},${parkStart[0]}`;
              walkingRoutes[parkKey] = (walkingRoutes[parkKey] || []).concat(walkingData.routes[0].geometry.coordinates);
            }
          }
        } else {
          // Single park point, fetch driving route from last driving point to park
          drivingRoutesPromises.push(fetchDrivingRoute(lastDrivingPoint, park));

          // Update last driving point to park
          lastDrivingPoint = park;
        }
      }

      // Fetch the driving routes
      const drivingRoutesData = await Promise.all(drivingRoutesPromises);
      setDrivingRoutes(drivingRoutesData);
      setWalkingRouteData(walkingRoutes);
    };

    const fetchDrivingRoute = async (start: number[], end: number[]) => {
      const drivingCoordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
      const drivingUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${drivingCoordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const drivingResponse = await fetch(drivingUrl);
      const drivingData = await drivingResponse.json();
      return drivingData.routes[0].geometry.coordinates;
    };

    fetchRoutes();
  }, [parkPoints, finalPoints]);

  // Flip points to be in lon, lat format for mapping
  const flippedPoints = finalPoints.map((point) => [point[1], point[0]]);
  const pointsExcludingLast = flippedPoints.slice(0, -1);
  const allLayers: any[] = [];

  const points_layer = new ScatterplotLayer({
    id: "scatterplot-layer",
    data: pointsExcludingLast,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 5,
    radiusMaxPixels: 10,
    lineWidthMinPixels: 1,
    getPosition: (d: any) => d,
    getRadius: (d: any) => 32,
    getFillColor: (d: any, { index }: { index: number }) => {
      if (index === 0) {
        return [0, 255, 0, 191];
      } else if (index === pointsExcludingLast.length - 1) {
        return [255, 0, 0, 191];
      }
      return [0, 150, 255, 191];
    },
    getLineColor: (d: any) => [0, 0, 0],
  });

  if (drivingRoutes.length > 0) {
    drivingRoutes.forEach((route, idx) => {
      const drivingLayer = new PathLayer({
        id: `driving-path-layer-${idx}`,
        data: [{ path: route }],
        getPath: d => d.path,
        getColor: () => getColor(idx) as any,
        widthMinPixels: 2,
      });

      allLayers.push(drivingLayer);
    });
  }

  Object.keys(walkingRouteData).forEach((key) => {
    if (walkingRouteData[key].length > 0) {
      const walkingLayer = new PathLayer({
        id: `walking-path-layer-${key}`,
        data: walkingRouteData[key].map((path: any) => ({ path })),
        getPath: d => d.path,
        getColor: () => [0, 255, 0, 200],
        widthMinPixels: 2,
      });
      allLayers.push(walkingLayer);
    }
  });

  // If there is a valid list of points, choose the first point as the default view point
  let startLatLon = [-96.70047, 40.820744]; // Default coordinates, lon and lat swapped
  if (finalPoints.length > 0) {
    startLatLon = [finalPoints[0][1], finalPoints[0][0]]; // Swap lat and lon here for the initial view point
  }

  allLayers.push(points_layer);

  return (
    <div style={{ height: "72.5vh" }}>
      <Map
        initialViewState={{
          latitude: startLatLon[1],
          longitude: startLatLon[0],
          zoom: 12,
        }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={mapboxgl.accessToken}
      >
        <DeckGLOverlay layers={allLayers} />
        <NavigationControl />
      </Map>
    </div>
  );
}
