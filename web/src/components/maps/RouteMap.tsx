import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polyline,
  useMapEvents,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";

const { BaseLayer } = LayersControl;

const shopIcon = new L.Icon({
  iconUrl: "/images/map-icons/home.png",
  iconSize: [25, 26],
  iconAnchor: [12, 13],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dumpIcon = new L.Icon({
  iconUrl: "/images/map-icons/dump-1.png",
  iconSize: [25, 25],
  iconAnchor: [12, 13],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pointIcon = new L.Icon({
  iconUrl: "/images/map-icons/trash.png",
  iconSize: [25, 28],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function chunkArray(array: any[], size: number) {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}

function ZoomHandler({
  setZoomLevel,
}: {
  setZoomLevel: (zoom: number) => void;
}) {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });
  return null;
}

export default function RouteMap({
  finalPoints,
  parkPoints,
}: {
  finalPoints: number[][];
  parkPoints: any[][];
}) {
  const [drivingRoutes, setDrivingRoutes] = useState<any[]>([]);
  const [walkingRouteData, setWalkingRouteData] = useState<{
    [key: string]: any[];
  }>({});
  const [zoomLevel, setZoomLevel] = useState(12);

  const adjustedFinalPoints = useMemo(() => {
    return finalPoints[0].toString() ===
      finalPoints[finalPoints.length - 1].toString()
      ? finalPoints.slice(0, -1)
      : finalPoints;
  }, [finalPoints]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const walkingRoutes: { [key: string]: any[] } = {};
      const drivingRoutesPromises: Promise<any>[] = [];

      let lastDrivingPoint = adjustedFinalPoints[0];

      for (const park of parkPoints) {
        if (Array.isArray(park[0])) {
          const parkStart = park[0];
          const parkEnd = park[park.length - 1];

          drivingRoutesPromises.push(
            fetchDrivingRoute(lastDrivingPoint, parkStart)
          );

          lastDrivingPoint = parkEnd;

          const parkChunks = chunkArray(park, 25);
          for (const chunk of parkChunks) {
            const walkingCoordinates = chunk.map((point) => [
              point[1],
              point[0],
            ]);
            if (chunk.length > 1) {
              const walkingUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${walkingCoordinates.join(
                ";"
              )}`;
              const walkingResponse = await fetch(
                `${walkingUrl}?geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
              );
              const walkingData = await walkingResponse.json();
              const parkKey = `${parkStart[1]},${parkStart[0]}`;
              walkingRoutes[parkKey] = (walkingRoutes[parkKey] || []).concat(
                walkingData.routes[0].geometry.coordinates.map((coord: any) => [
                  coord[1],
                  coord[0],
                ])
              );
            }
          }
        } else {
          drivingRoutesPromises.push(fetchDrivingRoute(lastDrivingPoint, park));

          lastDrivingPoint = park;
        }
      }

      const drivingRoutesData = await Promise.all(drivingRoutesPromises);
      setDrivingRoutes(drivingRoutesData);
      setWalkingRouteData(walkingRoutes);
    };

    const fetchDrivingRoute = async (start: number[], end: number[]) => {
      const drivingCoordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
      const drivingUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${drivingCoordinates}?geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
      const drivingResponse = await fetch(drivingUrl);
      const drivingData = await drivingResponse.json();
      return drivingData.routes[0].geometry.coordinates.map((coord: any) => [
        coord[1],
        coord[0],
      ]);
    };

    fetchRoutes();
  }, [parkPoints, adjustedFinalPoints]);

  function getColor(index: number) {
    const colors = [
      "red",
      "orange",
      "yellow",
      "cyan",
      "blue",
      "magenta",
      "purple",
    ];
    return colors[index % colors.length];
  }

  const startLatLon: L.LatLngTuple =
    adjustedFinalPoints.length > 0
      ? [adjustedFinalPoints[0][0], adjustedFinalPoints[0][1]]
      : [41.225876, -96.143424];

  return (
    <MapContainer
      center={startLatLon}
      zoom={12}
      style={{ height: "72.5vh" }}
      maxZoom={18}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="Satellite">
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
            tileSize={512}
            zoomOffset={-1}
          />
        </BaseLayer>
        <BaseLayer name="Satellite Streets">
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
            tileSize={512}
            zoomOffset={-1}
          />
        </BaseLayer>
        <BaseLayer name="Streets">
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
            tileSize={512}
            zoomOffset={-1}
          />
        </BaseLayer>
      </LayersControl>
      <ZoomHandler setZoomLevel={setZoomLevel} />
      {zoomLevel > 10 && (
        <>
          <Marker
            position={[adjustedFinalPoints[0][0], adjustedFinalPoints[0][1]]}
            icon={shopIcon}
          />
          <Marker
            position={[
              adjustedFinalPoints[adjustedFinalPoints.length - 1][0],
              adjustedFinalPoints[adjustedFinalPoints.length - 1][1],
            ]}
            icon={dumpIcon}
          />
        </>
      )}
      {/* TODO: Check exact zoom level and button for clustering */}
      {zoomLevel > 12 && (
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        disableClusteringAtZoom={18}
      >
        {adjustedFinalPoints.map((point, index) => {
          // Skip clustering shop and dump markers
          if (index === 0 || index === adjustedFinalPoints.length - 1) {
            return null;
          }
          return (
            <Marker
              key={index}
              position={[point[0], point[1]]}
              icon={pointIcon}
            />
          );
        })}
      </MarkerClusterGroup>
      )}
      {drivingRoutes.map((route, idx) => (
        <Polyline
          key={`driving-path-${idx}`}
          positions={route}
          color={getColor(idx)}
        />
      ))}
      {Object.keys(walkingRouteData).map((key, idx) => (
        <Polyline
          key={`walking-path-${idx}`}
          positions={walkingRouteData[key]}
          color="green"
        />
      ))}
    </MapContainer>
  );
}
