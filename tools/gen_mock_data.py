import json
import random
import logging
import argparse

class DataGenerator:
    def __init__(self, output, max_entries):
        self.first_names = ["John", "Mary", "George", "Sarah", "Michael", "Emily", "David", "Jessica", "James", "Jennifer"]
        self.last_names = ["Doe", "Peterson", "Hansen", "Smith", "Johnson", "Brown", "Wilson", "Taylor", "Jones", "Davis"]
        self.team = [0, 1, 2, 3, 4, 5, 6, 7]
        self.priority = [1, 2, 3, 4, 5]
        self.uid = ['A', 'T', 'B']
        self.active = [0, 1]
        self.format = "000"
        self.output = "../" + output
        self.max_entries = max_entries

        self.setup_logging()

    def setup_logging(self):
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)

    def format_number(self, number, template):
        number_str = str(number)
        
        if len(number_str) >= len(template):
            return number_str[-len(template):]
        else:
            diff = len(template) - len(number_str)
            formatted = template[:diff] + number_str
            return formatted

    def generate_data(self):
        # Create data for specified number of people with random names
        people_data = {}
        for i in range(1, self.max_entries):
            name = random.choice(self.first_names)
            person = {
                "uid": random.choice(self.uid) + self.format_number(random.randrange(1, 999999), "000000"),
                "name": name + " " + random.choice(self.last_names),
                "team": random.choice(self.team),
                "priority": random.choice(self.priority),
                "active": 1 #random.choice(self.active),
            }
            people_data.update({str(self.format_number(i, self.format)): person})
        return people_data

    def export_data(self, data):
        # Save the data to a JSON file
        with open(self.output, "w") as json_file:
            json.dump(data, json_file, indent=2)
        self.logger.info(f"Data has been exported to {self.output}")

def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate mock data and export to JSON.')
    parser.add_argument('-o', '--output', type=str, default='mock_data.json', help='Output file path')
    parser.add_argument('-m', '--max_entries', type=int, default=102, help='Maximum number of data entries to generate')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_arguments()

    generator = DataGenerator(args.output, args.max_entries)
    generated_data = generator.generate_data()
    generator.export_data(generated_data)
    generator.logger.info(generated_data)
