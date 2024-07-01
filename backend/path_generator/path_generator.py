from haversine import haversine, Unit
from sklearn.cluster import DBSCAN
import numpy as np
from scipy.spatial.distance import pdist, squareform
from tsp_solver.greedy_numpy import solve_tsp

DUMP_COORDS = (41.381526, -96.253521)
SHOP_COORDS = (41.225876, -96.143424)

# Constant for what is possible to visit while walking
WALKING_DISTANCE_THRESHOLD_KM = 0.5

def generate_path(points_list):
    parks = cluster_points_into_parks(points_list)
    park_ids = list(parks.keys())
    park_coords = [np.mean(parks[park_id], axis=0) for park_id in park_ids]

    # Compute the distance from SHOP_COORDS to each park
    # shop_to_park_distances = [haversine(SHOP_COORDS, park_coords[i], unit=Unit.KILOMETERS) for i in range(len(park_coords))]

    # Add DUMP_COORDS to the end of park_coords
    park_coords.append(DUMP_COORDS)

    # Compute park-to-park distances including DUMP_COORDS
    park_distances = compute_distance_matrix(park_coords)

    # Solve the TSP for parks with SHOP_COORDS as the start
    tsp_indices = solve_tsp(park_distances)

    # Identify the optimal order of parks excluding DUMP_COORDS
    optimal_park_order = [park_ids[i] for i in tsp_indices if i < len(park_ids)]

    # Generate within park routes
    within_park_routes = {}
    for park_id in park_ids:
        within_park_routes[park_id] = solve_within_park_route(parks[park_id])

    # Construct the final route starting from SHOP_COORDS
    final_route = [SHOP_COORDS]
    for park_id in optimal_park_order:
        final_route.extend(within_park_routes[park_id])

    # Append DUMP_COORDS before returning to SHOP_COORDS
    final_route.append(DUMP_COORDS)
    final_route.append(SHOP_COORDS)

    return final_route, within_park_routes

def cluster_points_into_parks(points_list):
    # Compute the distance matrix
    distance_matrix = squareform(pdist(points_list, metric=lambda u, v: haversine(u, v, unit=Unit.KILOMETERS)))

    # Perform DBSCAN clustering
    db = DBSCAN(eps=WALKING_DISTANCE_THRESHOLD_KM, min_samples=1, metric='precomputed')
    labels = db.fit_predict(distance_matrix)

    # Create parks dictionary
    parks = {i: [] for i in range(max(labels) + 1)}
    for point, label in zip(points_list, labels):
        parks[label].append(point)
    return parks

def compute_distance_matrix(coords):
    num_coords = len(coords)
    distance_matrix = np.zeros((num_coords, num_coords))
    for i in range(num_coords):
        for j in range(i + 1, num_coords):
            distance_matrix[i, j] = distance_matrix[j, i] = haversine(coords[i], coords[j])
    return distance_matrix

def solve_within_park_route(points):
    if len(points) <= 1:
        return points
    distance_matrix = compute_distance_matrix(points)
    route = solve_tsp(distance_matrix)
    return [points[i] for i in route]

def compute_distance_matrix(points):
    return squareform(pdist(points, metric=lambda u, v: haversine(u, v, unit=Unit.KILOMETERS)))
