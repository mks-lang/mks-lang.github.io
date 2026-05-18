
import os
import subprocess
import time
from playwright.sync_api import sync_playwright

def run_server():
    return subprocess.Popen(["python3", "-m", "http.server", "8003"])

def verify():
    server_process = run_server()
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(
                permissions=['clipboard-read', 'clipboard-write']
            )
            page = context.new_page()
            page.goto("http://localhost:8003/docs.html")
            page.wait_for_selector(".docs-copy-link")

            # Hover over a card to show the link
            first_card = page.locator("[data-docs-card]").first
            first_card.hover()
            time.sleep(0.5)
            page.screenshot(path="verification/final_hover.png")

            # Focus a button
            last_button = page.locator(".docs-copy-link").last
            last_button.focus()
            time.sleep(0.5)
            page.screenshot(path="verification/final_focus.png")

            browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    verify()
