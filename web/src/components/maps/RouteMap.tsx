import mapboxgl from "mapbox-gl";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox";
import Map, { useControl, NavigationControl } from "react-map-gl";
import { ScatterplotLayer } from "@deck.gl/layers";

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

export default function RouteMap({ points }: { points: number[][] }) {
  // Flip points to be in lon, lat format for mapping
  const flippedPoints = points.map((point) => [point[1], point[0]]);
  const allLayers: any[] = [];

  const points_layer = new ScatterplotLayer({
    id: "scatterplot-layer",
    data: flippedPoints,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 5,
    radiusMaxPixels: 10,
    lineWidthMinPixels: 1,
    getPosition: (d: any) => d,
    getRadius: (d: any) => 32,
    getFillColor: (d: any) => [0, 150, 255, 191],
    getLineColor: (d: any) => [0, 0, 0],
  });

  allLayers.push(points_layer);

  // If there is a valid list of points, choose the first point as the default view point
  let startLatLon = [-96.70047, 40.820744]; // Default coordinates, lon and lat swapped
  if (points.length > 0) {
    startLatLon = [points[0][1], points[0][0]]; // Swap lat and lon here for the initial view point
  }

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
