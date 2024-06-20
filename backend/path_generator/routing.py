import json
import os
from datetime import datetime
import pytz
import numpy as np

from kml_parser import Kml
from path_generator import generate_path


def routing_engine(filename: str):
    kml_results = Kml(f"../to_be_parsed/{filename}")
    points_list = kml_results.get_points_list()
    park_route, within_park_routes = generate_path(points_list)
    save_results(filename[:-4], park_route, within_park_routes)

    # print_routes(park_route, within_park_routes)


def save_results(filename: str, park_route, within_park_routes):
    USCTZ = pytz.timezone('US/Central')
    now = datetime.now(USCTZ).strftime('%Y-%m-%d_%H-%M-%S')

    # Convert numpy types to usable JSON types
    park_route = [int(p) if isinstance(p, np.integer)
                  else p for p in park_route]

    within_park_routes = {
        int(k) if isinstance(k, np.integer) else k: [
            (float(lat), float(lon)) if isinstance(
                lat, np.floating) else (lat, lon)
            for lat, lon in v
        ] for k, v in within_park_routes.items()
    }

    results = {
        "park_route": park_route,
        "within_park_routes": within_park_routes
    }

    if not os.path.exists("../results"):
        os.makedirs("../results")

    result_filename = f"../results/{filename}_results_{now}.json"

    with open(result_filename, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

    print(f"Results saved to {result_filename}")


def print_routes(park_route, within_park_routes):
    print("Optimal park-to-park route:")
    print(park_route)

    print("\nOptimal routes within each park:")
    for park_id, route in within_park_routes.items():
        print(f"Park {park_id}: {route}")


if __name__ == "__main__":
    USCTZ = pytz.timezone('US/Central')
    now = datetime.now(USCTZ).strftime('%Y-%m-%d_%H-%M-%S')
    logs = {}
    start = datetime.now()
    try:
        # Attempt to get files to be parsed
        files = os.listdir("../to_be_parsed")
    except FileNotFoundError as e:
        # Log if file is not found
        logs["ScriptErrors"] = "Error finding path to files. Error Message: " + \
            str(e)
        with open(f"/backend/logs/script_error_logs_{now}.json", "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4)
            exit()

    for file in files:
        # Pass each file to the routing engine
        if file.endswith(".kmz") or file.endswith(".kml"):
            routing_engine(file)
