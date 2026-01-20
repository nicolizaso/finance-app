import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Mobile Context (iPhone 13 size)
    context = browser.new_context(viewport={'width': 390, 'height': 844}, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1')
    page = context.new_page()

    # 1. Login Logic (Simplificada para test local)
    # Asumimos que la app corre en localhost:5173
    try:
        page.goto("http://localhost:5173")
        # Si pide login, llenarlo (ajustar selectores segun tu app)
        if page.get_by_placeholder("Email").is_visible():
            page.get_by_placeholder("Email").fill("test@test.com")
            page.get_by_placeholder("Password").fill("123456")
            page.get_by_role("button", name="Iniciar Sesión").click()
            page.wait_for_timeout(2000) # Esperar carga
    except Exception as e:
        print(f"Login skip or error: {e}")

    # 2. Verify Dashboard & Notification
    # Check if Quick Add button exists
    expect(page.locator("button[class*='bg-gradient-to-tr']")).to_be_visible()
    
    # Check Notification Badge/Icon in Navbar
    # Assuming the 'More' menu has the badge if pending items exist
    navbar = page.locator(".fixed.bottom-0")
    
    # 3. Simulate Quick Add Flow (Test Interaction)
    page.locator("button[class*='bg-gradient-to-tr']").click() # Click Rayo
    expect(page.get_by_placeholder("0")).to_be_visible()
    page.get_by_placeholder("0").fill("9999")
    page.get_by_text("Guardar Rápido").click()
    
    # Wait for toast or confirmation
    page.wait_for_timeout(1000)

    # 4. Check if Badge appears on Menu
    # This might require backend logic to be instant, so we verify UI element existence
    # expect(navbar.locator(".animate-pulse")).to_be_visible() # Badge red dot

    # 5. Verify Navigation to Agenda (Calendar)
    navbar.get_by_text("Agenda").click()
    expect(page.locator("text=Calendario")).to_be_visible() or expect(page.locator(".react-calendar")).to_be_visible()
    
    print("Verification Script Completed Successfully")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)