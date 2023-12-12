# python script_name.py -i data.xlsx -o data.json

import argparse
import pandas as pd
import json
import logging

class ExcelToJsonConverter:
    def __init__(self, excel_file_path):
        self.excel_file_path = excel_file_path
        self.data = None

    def read_excel(self):
        # Read Excel file into a pandas DataFrame, specifying 'ID' column as string to preserve leading zeros
        self.data = pd.read_excel(self.excel_file_path, dtype={'mid': str})

        # Set the first column as the index (assuming it contains IDs)
        self.data.set_index(self.data.columns[0], inplace=True)

    def convert_to_json(self, json_file_path):
        if self.data is None:
            raise ValueError("No data to convert. Read the Excel file first.")

        # Initialize an empty dictionary to store JSON data
        json_data = {}

        # Iterate through the DataFrame to construct the JSON structure
        for index, row in self.data.iterrows():
            json_data[index] = row.dropna().to_dict()

        # Save JSON data to a file with UTF-8 encoding
        with open(json_file_path, 'w') as file:
            json.dump(json_data, file, indent=2)

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    return logging.getLogger()

def parse_arguments():
    parser = argparse.ArgumentParser(description='Convert Excel file to JSON with specified format')
    parser.add_argument('-i', '--input_file', default='./data.xlsx', help='Input Excel file path')
    parser.add_argument('-o', '--output_file', default='../data.json', help='Output JSON file path')
    return parser.parse_args()

def main():
    logger = setup_logging()
    logger.info('Converting Excel to JSON...')
    args = parse_arguments()
    
    converter = ExcelToJsonConverter(args.input_file)
    converter.read_excel()
    converter.convert_to_json(args.output_file)
    
    logger.info('Conversion completed. JSON file saved at %s', args.output_file)

if __name__ == "__main__":
    main()
