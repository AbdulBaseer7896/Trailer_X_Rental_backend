# import urllib.request
# import logging

# # Set up logging
# logging.basicConfig(filename='scraping.log', level=logging.ERROR, format='%(asctime)s %(message)s')

# # Proxy details
# proxy_host = 'isp.visitxiangtan.com'
# proxy_port = '10006'
# proxy_user = 'user-spvmamew52-ip-198.145.164.125'
# proxy_pass = 'tR3_1oQSSdu8xijy6c'
# proxy_url = f"http://{proxy_user}:{proxy_pass}@{proxy_host}:{proxy_port}"

# # Create a ProxyHandler
# proxy_support = urllib.request.ProxyHandler({
#     "http": proxy_url,
#     "https": proxy_url
# })

# # Install the proxy
# opener = urllib.request.build_opener(proxy_support)
# urllib.request.install_opener(opener)

# # Function to make requests
# def make_request(url):
#     try:
#         req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
#         response = urllib.request.urlopen(req, timeout=10)  # 10 seconds timeout
#         return response.read()
#     except Exception as e:
#         logging.error(f"Request to {url} failed: {e}")
#         return None

# # Test the target URL with the proxy
# mc_number = 133525  # Replace with your MC number
# # target_url = f'https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string={mc_number}'
# target_url = 'https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=1335248'
# html = make_request(target_url)

# if html:
#     print("Successfully accessed target URL!")
#     print(html.decode())  # Decode the bytes to print the response
# else:
#     print("Failed to access target URL.")
