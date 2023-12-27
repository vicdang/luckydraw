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
   - python emp_requester.py <options>
   - python emp_requester.py -p 1885
                           -s "ST-101078-7BMYiRoQtcP3zZkgIAfiTcPaQNk-access" -d
"""

import argparse
import json
import logging
import re
import sys

import requests
from bs4 import BeautifulSoup
from openpyxl import Workbook

logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")


class APIClient(object):
   """_summary_

   Args:
       object (_type_): _description_
   """

   def __init__(self, base_url, headers):
      """_summary_

      Args:
          base_url (_type_): _description_
          headers (_type_): _description_
      """
      self.base_url = base_url
      self.headers = headers

   def make_request(self, project_id):
      """_summary_

      Args:
          project_id (_type_): _description_

      Returns:
          _type_: _description_
      """
      params = {
         "tf[favorite_contact][]": "",
         "tf[project_id][]": project_id,
         "tf_form": ""
         }
      response = requests.get(self.base_url, headers=self.headers,
                              params=params)
      # Check if the request was successful
      if response.status_code == 200:
         return response
      else:
         return None


class EmpRequester(object):
   """docstring for EmpRequester"""

   def __init__(self, arg):
      """_summary_

      Args:
          arg (_type_): _description_
      """
      super(EmpRequester, self).__init__()
      self.arg = arg
      self.project_id = arg.project_id
      self.php_sessid = arg.php_sessid
      self.base_url = "https://hrm.t%sa.com.vn/index.php/pim/viewContactSearch" \
                      "/pageNo/" % "m"
      # Define headers
      self.headers = {
         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
                   "image/avif,image/webp,image/apng,*/*;q=0.8,"
                   "application/signed-exchange;v=b3;q=0.7",
         "Accept-Language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
         "Connection": "keep-alive",
         "Cookie": "_ga=GA1.3.988384742.1683804099; "
                   "PHPSESSID=" + self.php_sessid,
         "Sec-Fetch-Dest": "document",
         "Sec-Fetch-Mode": "navigate",
         "Sec-Fetch-Site": "same-origin",
         "Sec-Fetch-User": "?1",
         "Upgrade-Insecure-Requests": "1",
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/119.0.0.0 Safari/537.36",
         "sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", '
                      '"Not?A_Brand";v="24"',
         "sec-ch-ua-mobile": "?0",
         "sec-ch-ua-platform": '"Windows"',
         }
      self.extracted_data = []

   def run(self):
      """_summary_

      Returns:
          _type_: _description_
      """
      page_num = 1
      while True:
         client = APIClient(self.base_url + str(page_num), self.headers)
         response = client.make_request(self.project_id)
         if response:
            # Use BeautifulSoup to parse HTML content and extract data
            soup = BeautifulSoup(response.text, "html.parser")
            self.extracted_data.extend(Util.extract_data_from_html(soup))
            if Util.check_end_data(soup):
               page_num += 1
            else:
               break
         else:
            return "Request failed or no response received"

      Util.extract_data_from_list(self.extracted_data,
                                  str(args.project_id) + '.xlsx')
      logging.info(f"Extracted Employee Names: {self.extracted_data}")


class Util(object):
   """docstring for Exporter"""

   def __init__(self, arg):
      """_summary_

      Args:
          arg (_type_): _description_
      """
      super(Util, self).__init__()
      self.arg = arg
      pass

   @staticmethod
   def extract_data_from_html(soup):
      """_summary_

      Args:
          soup (_type_): _description_

      Returns:
          _type_: _description_
      """
      # Example extraction: Find employee names with specific class
      # 'employee-name'
      script_tags = soup.find_all('script', string=re.compile(
            r'var employee(\d+) = ({.*?});', re.DOTALL))
      logging.debug('Script tag: %s' % script_tags)

      employee_data_list = []
      for script in script_tags:
         text = script.get_text()
         matches = re.findall(r'var employee\d+ = ({.*?});', text, re.DOTALL)
         for match in matches:
            # Handle single quotes to double quotes conversion for keys and
            # string values
            match = re.sub(r'(?<!\\)(\'[^\']*\')',
                           lambda x: f'"{x.group(1)[1:-1]}"', match)
            match = re.sub(r'(?<!\\)(\w+):', lambda x: f'"{x.group(1)}":',
                           match)
            try:
               emp_dict = json.loads(match)
               employee_data_list.append(emp_dict)
            except json.JSONDecodeError as e:
               logging.error(f"JSON decoding error: {e}")
               continue
      return employee_data_list

   @staticmethod
   def extract_data_from_list(data, file):
      """_summary_

      Args:
          data (_type_): _description_
          file (_type_): _description_
      """
      wb = Workbook()
      sheet = wb.active
      # Set column headers
      headers = list(data[0].keys())
      sheet.append(headers)
      # Add data to the worksheet
      for row_data in data:
         row_values = [row_data[key] for key in headers]
         sheet.append(row_values)
      # Save the workbook
      wb.save(file)

   @staticmethod
   def check_end_data(soup):
      """_summary_

      Args:
          soup (_type_): _description_

      Returns:
          _type_: _description_
      """
      ul_element = soup.find('ul', class_='paging top')
      if ul_element:
         li_element = ul_element.find('li', class_='desc')
         if li_element and li_element.text.strip():
            text = li_element.text.strip()
            match = re.search(r'\d+\s*-\s*(\d+)\s+of\s+(\d+)', text)
            if match:
               first_number, second_number = match.group(1), match.group(2)
               logging.info('%s of %s' % (first_number, second_number))
               return int(first_number) < int(second_number)


def setup_argparse():
   """_summary_

   Returns:
       _type_: _description_
   """
   parser = argparse.ArgumentParser(description="Make an API request")
   parser.add_argument("-p", "--project-id", dest="project_id",
                       default="1869", type=str,
                       help="Project ID for the API request")
   parser.add_argument("-s", "--php_sessid", dest="php_sessid",
                       default="ST-95723-51zlhLobAXglUw1d-d-FhO6SzRk-access",
                       type=str, help="PHP Session ID")
   parser.add_argument('-d', '--debug', action='store_true',
                       help='Enable debug mode')
   return parser.parse_args()


def setup_logging(debug=False):
   """_summary_

   Args:
       debug (bool, optional): _description_. Defaults to False.
   """
   if debug:
      log_level = logging.DEBUG
   else:
      log_level = logging.INFO
   logging.basicConfig(level=log_level,
                       format='%(asctime)s - %(levelname)s %(threadName)s - %('
                              'name)s %(funcName)s %(lineno)d : %('
                              'message)s',
                       stream=sys.stderr,
                       filemode='w')
   global logger
   logger = logging.getLogger('sLogger')


def main(arguments):
   """_summary_

   Args:
       arguments (_type_): _description_

   Returns:
       _type_: _description_
   """
   emp = EmpRequester(arguments)
   emp.run()
   return emp.extracted_data


if __name__ == "__main__":
   """_summary_
   """
   args = setup_argparse()
   setup_logging(args.debug)
   main(args)
   # try:
   #    result = main(args.project_id)
   #    logging.info(f"Extracted Employee Names: {result}")
   # except Exception as e:
   #    logging.error(f"An error occurred: {str(e)}")
