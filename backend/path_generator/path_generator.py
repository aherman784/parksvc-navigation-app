from haversine import haversine, Unit
from sklearn.cluster import KMeans
import numpy as np
import networkx as nx
from scipy.spatial.distance import pdist, squareform

# Constant for what is possible to visit while walking
WALKING_DISTANCE_THRESHOLD_KM = 1.5


def generate_path(points_list):
    parks = cluster_points_into_parks(points_list)

    park_ids = list(parks.keys())
    num_parks = len(park_ids)
    park_distances = {}

    for i in range(num_parks):
        for j in range(i + 1, num_parks):
            park_id1 = park_ids[i]
            park_id2 = park_ids[j]
            park1_points = parks[park_id1]
            park2_points = parks[park_id2]

            # Calculate distance between parks
            distance = haversine(get_centroid(park1_points), get_centroid(
                park2_points), unit=Unit.KILOMETERS)

            park_distances[(park_id1, park_id2)] = distance
            park_distances[(park_id2, park_id1)] = distance

    park_route = solve_tsp_for_parks(park_ids, park_distances)

    within_park_routes = {}
    for park_id in park_route:
        points_within_park = parks[park_id]
        within_park_routes[park_id] = solve_tsp_for_points(points_within_park)

    return park_route, within_park_routes


def cluster_points_into_parks(points_list):
    points_array = np.array(points_list)

    # Use KMeans for clustering based on proximity
    num_clusters = estimate_optimal_clusters(points_array)
    kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(points_array)
    labels = kmeans.labels_

    # Organize points into clusters (each park)
    parks = {}
    for point, label in zip(points_list, labels):
        if label not in parks:
            parks[label] = []
        parks[label].append(point)

    return parks


def estimate_optimal_clusters(points_array):
    return int(np.sqrt(len(points_array) / 2))


def get_centroid(points):
    latitudes, longitudes = zip(*points)
    return np.mean(latitudes), np.mean(longitudes)


def solve_tsp_for_parks(park_ids, park_distances):
    graph = nx.Graph()
    for park_id1 in park_ids:
        for park_id2 in park_ids:
            if park_id1 != park_id2:
                graph.add_edge(park_id1, park_id2, weight=park_distances.get(
                    (park_id1, park_id2), float('inf')))

    tsp_path = nx.approximation.traveling_salesman_problem(graph, cycle=True)

    return tsp_path


def solve_tsp_for_points(points):
    num_points = len(points)
    if num_points <= 1:
        return points

    dist_matrix = squareform(
        pdist(points, (lambda u, v: haversine(u, v, unit=Unit.KILOMETERS))))

    tsp_path = [0]
    remaining_points = set(range(1, num_points))

    while remaining_points:
        current_point = tsp_path[-1]
        nearest_point = min(
            remaining_points, key=lambda x: dist_matrix[current_point, x])
        tsp_path.append(nearest_point)
        remaining_points.remove(nearest_point)

     # Convert indices back to points
    tsp_path = [points[i] for i in tsp_path]

    return tsp_path


# Example usage for testing
if __name__ == "__main__":
    points_list = [(40.748817, -73.985428),
                   (40.749271, -73.985399),
                   (40.748363, -73.985080),
                   (40.749738, -73.985646),
                   (40.748951, -73.984961),
                   (40.748501, -73.984855),
                   (40.747968, -73.984774),
                   (40.748094, -73.985972)]

    park_route, within_park_routes = generate_path(points_list)

    print("Optimal park-to-park route:", park_route)
    for park_id, route in within_park_routes.items():
        print(f"Optimal route within Park {park_id}: {route}")
