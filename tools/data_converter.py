# -*- coding: utf-8 -*-
# vim:ts=3:sw=3:expandtabs
"""
---------------------------
Copyright (C) 2023
@Authors: dnnvu
@Date: 28-Nov-23
@Version: 1.0
---------------------------
 Location:
   - src
 Usage example:
   - python script_name.py -i data.xlsx -o data.json
"""

# Import
import argparse
import pandas as pd
import json
import logging

# Logger
logger = logging.getLogger(__name__)

class ExcelToJsonConverter:
    """_summary_
    """
    def __init__(self, excel_file_path):
        """_summary_

        Args:
            excel_file_path (_type_): _description_
        """
        self.excel_file_path = excel_file_path
        self.data = None

    def read_excel(self):
        """_summary_
        """
        # Read Excel file into a pandas DataFrame, specifying 'ID' column as string to preserve leading zeros
        # with open(self.excel_file_path, 'rb') as f:
        self.data = pd.read_excel(self.excel_file_path, dtype={'uid': str})
        logger.debug(self.data)

        # Set the first column as the index (assuming it contains IDs)
        self.data.set_index(self.data.columns[0], inplace=True)

    def convert_to_json(self, json_file_path):
        """_summary_

        Args:
            json_file_path (_type_): _description_

        Raises:
            ValueError: _description_
        """
        if self.data is None:
            raise ValueError("No data to convert. Read the Excel file first.")

        # Initialize an empty dictionary to store JSON data
        json_data = {}

        # Iterate through the DataFrame to construct the JSON structure
        for index, row in self.data.iterrows():
            logger.debug(index)
            logger.debug(row)
            json_data[index] = row.dropna().to_dict()

        # Save JSON data to a file with UTF-8 encoding
        with open(json_file_path, 'w') as file:
            # logger.debug(json_data)
            json.dump(json_data, file, indent=2)

def setup_logging():
    """_summary_

    Returns:
        _type_: _description_
    """
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    return logging.getLogger()

def parse_arguments():
    """_summary_

    Returns:
        _type_: _description_
    """
    parser = argparse.ArgumentParser(description='Convert Excel file to JSON with specified format')
    parser.add_argument('-i', '--input-file', default='./data.xlsx', help='Input Excel file path')
    parser.add_argument('-o', '--output-file', default='../data.json', help='Output JSON file path')
    parser.add_argument('-d', '--debug', default=False, action='store_true', help='Enable debuging')
    return parser.parse_args()

def main():
    """_summary_
    """
    logger = setup_logging()
    logger.info('Converting Excel to JSON...')
    args = parse_arguments()
    if args.debug:
        logger.setLevel(logging.DEBUG)
    logger.debug(args)
    converter = ExcelToJsonConverter(args.input_file)
    converter.read_excel()
    converter.convert_to_json(args.output_file)
    
    logger.info('Conversion completed. JSON file saved at %s', args.output_file)

if __name__ == "__main__":
    main()
