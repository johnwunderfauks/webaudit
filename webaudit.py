import requests
import urllib3
from bs4 import BeautifulSoup


URL = "https://wunderfauks.com/"

# pageSize = len(page.content)
# Gzip/Cache
pageHeaders = requests.get(URL, stream=True).headers
page = requests.get(URL)
soup = BeautifulSoup(page.content, "html.parser")
results = soup.find(id="ResultsContainer")

with requests.get(URL, stream=True) as response:
    size = sum(len(chunk) for chunk in response.iter_content(8196))
size

# Page size
print(f"Webaudit: {URL}\n")
print(f"Page Header: {pageHeaders}\n")
print(f"Page Size: {size/1024} mb\n")
# Look for Python jobs
# print("PYTHON JOBS\n==============================\n")
# python_jobs = results.find_all("h2", string=lambda text: "python" in text.lower())
# python_job_elements = [h2_element.parent.parent.parent for h2_element in python_jobs]

# for job_element in python_job_elements:
#     title_element = job_element.find("h2", class_="title")
#     company_element = job_element.find("h3", class_="company")
#     location_element = job_element.find("p", class_="location")
#     print(title_element.text.strip())
#     print(company_element.text.strip())
#     print(location_element.text.strip())
#     link_url = job_element.find_all("a")[1]["href"]
#     print(f"Apply here: {link_url}\n")
#     print()
