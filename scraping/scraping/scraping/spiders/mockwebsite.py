from telnetlib import EC
from scrapy.selector import Selector
import scrapy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC



class MockwebsiteSpider(scrapy.Spider):
    name = "mockwebsite"
    allowed_domains = [""]
    start_urls = ["http://localhost:3000"]

    def read_current_table(self, driver, html_content):
        try:
            sel = Selector(text=html_content)
            rows = sel.css("tbody tr")
            for row in rows:
                car_make = row.css("td:nth-child(1)::text").get()
                car_model = row.css("td:nth-child(2)::text").get()
                price = row.css("td:nth-child(3)::text").get()
                car_vin = row.css("td:nth-child(4)::text").get()
                car_color = row.css("td:nth-child(5)::text").get()

                car = {
                    "make": car_make,
                    "model": car_model,
                    "price": price,
                    "vin": car_vin,
                    "color": car_color,
                }
                yield car
        except TimeoutException:
            print("TimeoutException: Element not found")
            return

    def start_requests(self):
        
        yield scrapy.Request(callback=self.parse, url=self.start_urls[0])

    def parse(self, response):
        with webdriver.Chrome() as driver:
            driver.get(response.url)
            finished = False
            while not finished: 
                # Wait for the page to load
                try:
                    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.mt-5.container")))

                    html_content = driver.page_source
                    
                except TimeoutException:
                    print("TimeoutException: Element not found")
                    return  

                sel = Selector(text=html_content)
                rows = sel.css("tbody tr")
                for row in rows:
                    car_make = row.css("td:nth-child(1)::text").get()
                    car_model = row.css("td:nth-child(2)::text").get()
                    price = row.css("td:nth-child(3)::text").get()
                    car_vin = row.css("td:nth-child(4)::text").get()
                    car_color = row.css("td:nth-child(5)::text").get()

                    car = {
                        "make": car_make,
                        "model": car_model,
                        "price": price,
                        "vin": car_vin,
                        "color": car_color,
                    }
                    yield car
                # Find the next button element
                next_button = driver.find_element(By.CSS_SELECTOR, "button.nextpage.btn.btn-secondary")

                # Check if the next button is present
                if next_button and next_button.is_enabled():
                    # Click the next button
                    print("Clicking next button")
                    next_button.click()
                else:
                    finished = True


        pass
