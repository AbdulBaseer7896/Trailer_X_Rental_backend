from datetime import date
import re
import urllib.request
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import time
import random
from urllib.error import HTTPError
import logging
import json

# Setting up logging
logging.basicConfig(filename='scraping.log', level=logging.ERROR, format='%(asctime)s %(message)s')

rows = []

import sys



start_point = int(sys.argv[1]) if len(sys.argv) > 1 else 133525

def find_marked_labels(src):
    marked_label = []
    if src and src.findAll('td', string='X'):
        all_marked = src.findAll('td', string='X')
        for label in all_marked:
            marked_label.append(label.find_next_sibling("td").text)
    return marked_label

def find_dot_email(dot_number):
    req = Request('https://ai.fmcsa.dot.gov/SMS/Carrier/' + dot_number + '/CarrierRegistration.aspx',
                headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urlopen(req).read()
    except HTTPError as error:
        logging.error(f'HTTPError for dot number {dot_number}: {error}')
        time.sleep(round(random.uniform(5, 10), 2))
        return ''

    bs = BeautifulSoup(html, 'html.parser')
    for lab in bs.select("label"):
        if 'Email:' in lab.text:
            return lab.find_next_sibling().text
    return ''

def crawl_data(url, MC):
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urlopen(req).read()
    except HTTPError as error:
        logging.error(f'HTTPError for MC {MC}: {error}')
        time.sleep(round(random.uniform(5, 10), 2))
        return

    bs = BeautifulSoup(html, 'html.parser')
    bold_texts = bs.find_all('b')
    crawl_date = ''
    for b in bold_texts:
        try:
            crawl_date = re.search('The information below reflects the content of the FMCSA management information systems as of(.*).', b.get_text(strip=True, separator='  ')).group(1).strip()
            if len(crawl_date) > 11:
                crawl_date = crawl_date.split(".", 1)[0]
        except AttributeError:
            pass

    if bs.find('center') is None:
        logging.error(f'Data Not found for MC {MC}')
        return

    information = bs.find('center').get_text(strip=True, separator='  ')
    
    # Replace `text` with `string` to avoid DeprecationWarning
    entity_type_th = bs.find('th', string='Entity Type:')
    entity = entity_type_th.find_next_sibling('td').get_text(strip=True) if entity_type_th else ''

    operating_authority_status_th = bs.find('th', string='Operating Authority Status:')
    operating_authority_status = operating_authority_status_th.find_next_sibling('td').get_text(strip=True) if operating_authority_status_th else ''

    legal_name_match = re.search('Legal Name:(.*)DBA', information)
    legal_name = legal_name_match.group(1).strip() if legal_name_match else ''

    # dba_name_match = re.search('DBA Name:(.*)Physical Address', information)
    # dba_name = dba_name_match.group(1).strip() if dba_name_match else ''

    physical_address_match = re.search('Physical Address:(.*)Phone', information)
    physical_address = physical_address_match.group(1).strip() if physical_address_match else ''

    phone_match = re.search('Phone:(.*)Mailing Address', information)
    phone = phone_match.group(1).strip() if phone_match else ''

    # mailing_address_match = re.search('Mailing Address:(.*)USDOT', information)
    # mailing_address = mailing_address_match.group(1).strip() if mailing_address_match else ''

    usdot_address_match = re.search('USDOT Number:(.*)State Carrier ID Number', information)
    usdot_address = usdot_address_match.group(1).strip() if usdot_address_match else ''

    # power_units_match = re.search('Power Units:(.*)Drivers', information)
    # power_units = power_units_match.group(1).strip() if power_units_match else ''

    # drivers_match = re.search('Drivers:(.*)MCS-150 Form Date', information)
    # drivers = drivers_match.group(1).strip() if drivers_match else 'N/A'

    # DUNS_Number_match = re.search('DUNS Number:(.*)Power Units', information)
    # DUNS_Number = DUNS_Number_match.group(1).strip() if DUNS_Number_match else ''

    # State_Carrier_ID_Number_match = re.search('State Carrier ID Number:(.*)MC/MX/FF Number\(s\)', information)
    # State_Carrier_ID_Number = State_Carrier_ID_Number_match.group(1).strip() if State_Carrier_ID_Number_match else ''

    # MCS_150_Form_Date_match = re.search('MCS-150 Form Date:(.*)MCS', information)
    # MCS_150_Form_Date = MCS_150_Form_Date_match.group(1).strip() if MCS_150_Form_Date_match else ''

    # Out_of_Service_Date_match = re.search('Out of Service Date:(.*)Legal Name', information)
    # Out_of_Service_Date = Out_of_Service_Date_match.group(1).strip() if Out_of_Service_Date_match else ''

    # MCS_150_MILAGE_YEAR_match = re.search('MCS-150 Mileage \(Year\):(.*)Operation Classification', information)
    # MCS_150_MILAGE_YEAR = MCS_150_MILAGE_YEAR_match.group(1).strip().replace('Operation Classification:', '') if MCS_150_MILAGE_YEAR_match else ''

    # Operation_Classification = find_marked_labels(bs.find('table', {'summary': "Operation Classification"}))
    # Carrier_Operation = find_marked_labels(bs.find('table', {'summary': "Carrier Operation"}))
    # Cargo_Carried = find_marked_labels(bs.find('table', {'summary': "Cargo Carried"}))
    email = find_dot_email(usdot_address)

    if entity == "CARRIER" and operating_authority_status == "AUTHORIZED FOR PropertyFor Licensing and Insurance detailsclick here.":
        rows.append({
            # 'Date': crawl_date,
            # 'Operating Authority Status': operating_authority_status,
            'Legal_Name': legal_name,
            'Physical_Address': physical_address, 
            # 'Mailing_Address': mailing_address,
            # 'Power Units': power_units, 'Drivers': drivers,
            'MC': MC,
            # 'Entity Type': entity,
            'Phone': phone,
            'USDOT_Number': usdot_address,
            # 'MCS-150 Form Date': MCS_150_Form_Date,
            # 'MCS-150 Mileage (Year)': MCS_150_MILAGE_YEAR,
            # 'Operation Classification': Operation_Classification,
            # 'Carrier Operation': Carrier_Operation,
            # 'Cargo Carried': Cargo_Carried,
            # 'Out of Service Date': Out_of_Service_Date,
            # 'DBA Name': dba_name,
            # 'State Carrier ID Number': State_Carrier_ID_Number,
            # 'DUNS Number': DUNS_Number,
            'Email': email
        })

def get_data_as_json(MC):
    MC = str(MC)
    crawl_data('https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=' + MC, MC)
    
    if rows:
        return json.dumps(rows, indent=4)
    else:
        return json.dumps({"error": "No data found for MC " + MC})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        MC = sys.argv[1]
        json_data = get_data_as_json(MC)
        print(json_data)
