import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mocking Login
        page.route("**/api/users/login", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"success": true, "user": {"username": "TestUser", "pin": "1234", "_id": "mock_id"}}'
        ))

        # Mocking Savings Goals (Initial Empty)
        page.route("**/api/savings-goals", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"success": true, "data": []}'
        ))

        # Mocking Create Savings Goal
        page.route("**/api/savings-goals", lambda route: route.continue_() if route.request.method == "GET" else route.fulfill(
            status=200,
            content_type="application/json",
            body='{"success": true, "data": {"_id": "new_goal", "title": "New Goal", "targetAmount": 100, "currentAmount": 0, "currency": "USD"}, "gamification": {}}'
        ))

        page.goto("http://localhost:5173")

        # Handle UserScreen
        page.get_by_placeholder("Nombre de usuario").fill("TestUser")
        page.get_by_role("button", name="Continuar").click()

        # Handle PinScreen
        page.get_by_text("1", exact=True).click()
        page.get_by_text("2", exact=True).click()
        page.get_by_text("3", exact=True).click()
        page.get_by_text("4", exact=True).click()

        # Navigate to Savings View via Navbar "Metas" (Desktop)
        page.get_by_role("link", name="Metas", exact=True).first.click()

        # Verify Empty State
        expect(page.get_by_text("No tienes metas aún")).to_be_visible()

        # Click "Crear Primera Meta"
        page.get_by_role("button", name="Crear Primera Meta").click()

        # Verify Form appears - use heading
        expect(page.get_by_role("heading", name="Nueva Meta")).to_be_visible()

        # Fill Form
        page.get_by_placeholder("Ej: Viaje a Japón").fill("My USD Goal")
        page.get_by_placeholder("100000").fill("500")

        # Select Currency USD
        page.get_by_role("button", name="USD").click()

        # Update mock for subsequent fetch
        page.route("**/api/savings-goals", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body='{"success": true, "data": [{"_id": "1", "title": "My USD Goal", "targetAmount": 500, "currentAmount": 0, "currency": "USD", "icon": "PiggyBank", "color": "#10b981"}]}'
        ))

        # Submit
        page.get_by_role("button", name="Crear Meta").click()

        # Wait for card to appear
        expect(page.get_by_text("My USD Goal")).to_be_visible()

        time.sleep(1) # wait for animations
        page.screenshot(path="verification/savings_view.png")

        browser.close()

if __name__ == "__main__":
    run()
