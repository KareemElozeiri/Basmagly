import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class TestTest1():
    def setup_method(self, method):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)  # 10 second timeout
        self.vars = {}
        # Maximize window to ensure consistent element visibility
        self.driver.maximize_window()
    
    def teardown_method(self, method):
        if self.driver:
            self.driver.quit()
    
    def wait_and_find_element(self, by, value):
        """Helper method to wait for and find an element"""
        try:
            element = self.wait.until(
                EC.presence_of_element_located((by, value))
            )
            # Add a small pause to ensure element is interactable
            time.sleep(0.5)
            return element
        except TimeoutException:
            raise TimeoutException(f"Element not found with {by}={value} after 10 seconds")

    def test_test1(self):
        try:
            # Navigate to the page
            self.driver.get("http://localhost:3000/")
            
            # Login
            self.wait_and_find_element(By.CSS_SELECTOR, ".login .input-box:nth-child(2) > input").send_keys("hatem")
            self.wait_and_find_element(By.CSS_SELECTOR, ".login .input-box:nth-child(3) > input").send_keys("Qwert12345@")
            self.wait_and_find_element(By.CSS_SELECTOR, "button:nth-child(4)").click()
            
            # Navigation
            self.wait_and_find_element(By.LINK_TEXT, "About Us").click()
            self.wait_and_find_element(By.CSS_SELECTOR, ".nav-button:nth-child(1)").click()
            
            # Feedback section
            self.wait_and_find_element(By.LINK_TEXT, "Feedback").click()
            self.wait_and_find_element(By.CSS_SELECTOR, ".rating-button:nth-child(4)").click()
            feedback_element = self.wait_and_find_element(By.ID, "feedback")
            feedback_element.click()
            feedback_element.send_keys("Great!!")
            self.wait_and_find_element(By.CSS_SELECTOR, ".contact-email").click()
            self.wait_and_find_element(By.CSS_SELECTOR, ".submit-button").click()
            
            # File upload and chat
            self.wait_and_find_element(By.CSS_SELECTOR, ".link:nth-child(3) > .icon").click()
            upload_input = self.wait_and_find_element(By.CSS_SELECTOR, ".upload-section > input")
            upload_input.send_keys("C:\\Users\\world\\Downloads\\Changing Password Guide.pdf")
            self.wait_and_find_element(By.CSS_SELECTOR, ".upload-btn").click()
            
            # Chat interaction
            self.wait_and_find_element(By.CSS_SELECTOR, ".link:nth-child(4) > .icon").click()
            chat_input = self.wait_and_find_element(By.CSS_SELECTOR, "input:nth-child(3)")
            messages = ["Hi", "could you summarize the file?", "Thank you"]
            for message in messages:
                chat_input.send_keys(message)
                chat_input.send_keys(Keys.ENTER)
                time.sleep(1)  # Wait for message to be sent
            
            # Quiz section
            self.wait_and_find_element(By.CSS_SELECTOR, ".link:nth-child(5) > .icon").click()
            
            # Set timer and questions
            timer = self.wait_and_find_element(By.ID, "timer")
            # timer.send_keys("1")
            
            questions = self.wait_and_find_element(By.ID, "questions")
            # questions.send_keys("5")
            
            self.wait_and_find_element(By.CSS_SELECTOR, ".start-button").click()
            
            # Answer questions
            for i in range(2, 6):
                self.wait_and_find_element(
                    By.CSS_SELECTOR, 
                    f".question-card:nth-child({i}) .option:nth-child(3) > label"
                ).click()
                time.sleep(0.5)  # Small delay between answers
            
            self.wait_and_find_element(By.CSS_SELECTOR, ".submit-button").click()
            
            # Profile update
            self.wait_and_find_element(By.CSS_SELECTOR, ".user-menu").click()
            self.wait_and_find_element(By.LINK_TEXT, "Profile").click()
            name_input = self.wait_and_find_element(By.NAME, "name")
            name_input.clear()  # Clear existing text
            name_input.send_keys("mohamed saleh")
            self.wait_and_find_element(By.CSS_SELECTOR, ".update-button").click()
            
            # Verify alert
            alert = self.wait.until(EC.alert_is_present())
            assert alert.text == "Profile updated successfully!"
            alert.accept()
            self.wait_and_find_element(By.CSS_SELECTOR, ".nav-button:nth-child(1)").click()
            
            # Logout
            self.wait_and_find_element(By.CSS_SELECTOR, ".user-menu").click()
            self.wait_and_find_element(By.LINK_TEXT, "Log Out").click()
            
        except Exception as e:
            # Take screenshot on failure
            self.driver.save_screenshot(f"test_failure_{time.strftime('%Y%m%d_%H%M%S')}.png")
            raise e

if __name__ == "__main__":
    pytest.main()