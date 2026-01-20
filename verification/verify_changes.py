from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Login
    page.goto("http://localhost:5173")

    # Try bypassing login if already logged in or force it
    # Just fill user and press enter if input exists
    try:
        if page.is_visible("input[placeholder='Nombre de usuario']"):
            page.fill("input[placeholder='Nombre de usuario']", "TestUser")
            page.press("input[placeholder='Nombre de usuario']", "Enter")
    except:
        pass

    # Wait for PIN screen or Main screen
    time.sleep(2)
    if page.is_visible("text=Ingresa tu PIN"):
         for digit in "1234":
            page.click(f"button:has-text('{digit}')")

    time.sleep(2)

    # 3. Go to Planning (Wishlist)
    page.goto("http://localhost:5173/planning")
    time.sleep(2)
    page.screenshot(path="verification/1_planning_view.png")

    # 4. Create a Wishlist Project
    # Attempt to just click the plus button if visible on page
    # It might be an SVG without text, so finding by class or hierarchy is best
    # The Plus button is in the WishlistCard header.

    try:
        # Find the card header
        # Click the button that contains the Plus icon
        page.click("button >> :scope:has(svg.lucide-plus)", timeout=5000)
    except:
        # Fallback: click any button in the card header area
        page.locator(".bento-card button").first.click()

    time.sleep(1)

    # Fill form
    if page.is_visible("input[placeholder*='Decoración']"):
        page.fill("input[placeholder*='Decoración']", "Proyecto Test Playwright")
        page.click("text=Proyecto")

        # Add Item
        page.fill("input[placeholder='Descripción Item']", "Item 1")
        page.fill("input[placeholder='Precio Est.']", "5000")

        page.click("text=Agregar a la lista")
        page.click("text=Crear Proyecto")
        time.sleep(2)

    # 5. Verify Creation & Edit
    if page.is_visible("text=Proyecto Test Playwright"):
        page.click("text=Proyecto Test Playwright")
        time.sleep(0.5)
        page.click("text=Editar")
        time.sleep(1)
        page.screenshot(path="verification/2_edit_modal.png")
        page.keyboard.press("Escape")

    # 6. Go to Calendar
    page.goto("http://localhost:5173/calendar")
    time.sleep(2)
    page.screenshot(path="verification/3_calendar_view.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
