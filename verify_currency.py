import time
from playwright.sync_api import sync_playwright

def test_currency_conversion():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock API calls to ensure stability
        # Login mock
        def handle_login(route):
            print("Intercepted login request")
            route.fulfill(status=200, body='{"success": true, "user": {"username": "TestUser", "name": "Test User"}}')

        page.route("**/api/users/login", handle_login)
        page.route("**/api/transactions/tags", lambda route: route.fulfill(status=200, body='{"success": true, "data": ["Comida", "Varios"]}'))
        page.route("**/api/transactions", lambda route: route.fulfill(status=200, body='{"success": true, "data": []}'))
        page.route("**/api/wealth", lambda route: route.fulfill(status=200, body='{"success": true, "data": []}'))
        page.route("**/api/fixed-expenses/generate", lambda route: route.fulfill(status=200, body='{"success": true}'))

        print("Navigating to home...")
        page.goto("http://localhost:5173")
        time.sleep(2)

        # 1. UserScreen
        if page.get_by_placeholder("Nombre de usuario").is_visible():
            print("At UserScreen. Filling username...")
            page.get_by_placeholder("Nombre de usuario").fill("TestUser")
            # Button is "Continuar"
            page.get_by_role("button", name="Continuar").click()
            time.sleep(1)

        # 2. PinScreen
        # It should appear now.
        if page.get_by_text("Ingresa tu PIN").is_visible() or page.get_by_text("Hola, TestUser").is_visible():
            print("At PinScreen. Entering PIN...")
            # Click buttons 1, 2, 3, 4
            for digit in ['1', '2', '3', '4']:
                page.get_by_role("button", name=digit, exact=True).click()
                time.sleep(0.1)

            # Wait for login to process
            time.sleep(2)
        else:
            print("PinScreen NOT detected. Current content:")
            print(page.content())

        # 3. Home / TransactionForm
        print("Checking for TransactionForm...")
        # Check if we are at home. "Agregar" should be in the header of the form.
        # Or look for "Gasto" / "Ingreso" toggle.

        if page.get_by_text("Agregar").is_visible():
            print("Home detected. Looking for Currency Toggle...")

            # Find the currency toggle button. It initializes as "ARS".
            toggle_btn = page.get_by_role("button", name="ARS", exact=True)

            if toggle_btn.is_visible():
                print("Currency toggle FOUND.")

                # Fill amount
                page.get_by_placeholder("0.00").fill("100")

                # Click to switch to USD
                toggle_btn.click()
                time.sleep(1)

                # Check if it switched to USD
                if page.get_by_role("button", name="USD", exact=True).is_visible():
                    print("Switched to USD.")

                    # Verify conversion text
                    # Look for text containing "≈ $" and "Blue" (default)
                    # We can't know the exact value, but we can search for the text pattern.
                    # Or just wait a bit and take screenshot.
                    time.sleep(2) # Ensure rates are fetched (if real fetch)

                    # We are not mocking dolarapi.com, so it should fetch real rates.
                    # If it fails, text won't show.

                    page.screenshot(path="/home/jules/verification/transaction_form_usd.png")
                    print("Screenshot taken: transaction_form_usd.png")

                    # 4. Settings (Menu)
                    print("Navigating to Menu...")
                    page.goto("http://localhost:5173/menu")
                    time.sleep(1)

                    if page.get_by_text("Cotización Dólar Preferida").is_visible():
                         print("Settings found.")
                         page.screenshot(path="/home/jules/verification/menu_settings.png")
                         print("Screenshot taken: menu_settings.png")
                    else:
                         print("Settings NOT found in Menu.")
                         page.screenshot(path="/home/jules/verification/menu_fail.png")

                else:
                    print("Failed to switch to USD.")
            else:
                print("Currency toggle 'ARS' NOT found.")
                page.screenshot(path="/home/jules/verification/home_fail.png")
        else:
            print("Not at Home.")
            page.screenshot(path="/home/jules/verification/login_fail.png")

        browser.close()

if __name__ == "__main__":
    test_currency_conversion()
