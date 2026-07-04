from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:3000/shop/visual-search")
        page.wait_for_timeout(2000) # Give it time to load the UI
        page.screenshot(path="verification_visual_search.png", full_page=True)

        page.goto("http://localhost:3000/admin/upload")
        page.wait_for_timeout(2000) # Give it time to load the UI
        page.screenshot(path="verification_admin_upload.png", full_page=True)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
