import zipfile
from xml.etree import ElementTree as ET


class Kml:
    def __init__(self, file_path):
        self.lat_list = []
        self.lon_list = []
        self.points_list = []
        self.parse_file(file_path)

    def parse_kml_content(self, kml_content):
        root = ET.fromstring(kml_content)
        namespaces = {'kml': 'http://www.opengis.net/kml/2.2'}

        # Find all coordinates elements in the KML file
        for placemark in root.findall('.//kml:Placemark', namespaces):
            for coord in placemark.findall('.//kml:coordinates', namespaces):
                coords = coord.text.strip().split()
                for c in coords:
                    lon, lat, *_ = map(float, c.split(','))
                    self.lat_list.append(lat)
                    self.lon_list.append(lon)
                    self.points_list.append((lat, lon))

    def parse_kml_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            kml_content = file.read()
        self.parse_kml_content(kml_content)

    def parse_kmz_file(self, file_path):
        with zipfile.ZipFile(file_path, 'r') as kmz:
            for name in kmz.namelist():
                if name.endswith('.kml'):
                    kml_content = kmz.read(name).decode('utf-8')
                    self.parse_kml_content(kml_content)
                    return

    # Determine if file is kml or kmz and call the respective function
    def parse_file(self, file_path):
        if file_path.endswith('.kml'):
            self.parse_kml_file(file_path)
        elif file_path.endswith('.kmz'):
            self.parse_kmz_file(file_path)
        else:
            raise ValueError(
                "Unsupported file format. Please provide a KML or KMZ file.")

    def get_lat_list(self):
        return self.lat_list

    def get_lon_list(self):
        return self.lon_list

    def get_points_list(self):
        return self.points_list
