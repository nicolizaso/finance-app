
from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile view
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        page.goto("http://localhost:5173")

        # 1. Login
        if page.get_by_placeholder("Nombre de usuario").is_visible():
            print("Logging in...")
            page.get_by_placeholder("Nombre de usuario").fill("TestUser")
            page.get_by_role("button", name="Continuar").click()
            expect(page.get_by_text("Ingresa tu PIN")).to_be_visible()

            # Mock API
            page.route("**/api/users/login", lambda route: route.fulfill(
                status=200, content_type="application/json", body='{"success": true, "user": {"username": "TestUser", "_id": "mock_id", "pushToken": null}}'
            ))

            mock_transactions = {
                "success": True,
                "data": [
                    {
                        "_id": "t1", "description": "Gasto Rápido Test", "amount": 50000, "type": "EXPENSE",
                        "category": "Varios", "date": "2023-10-27T00:00:00.000Z", "needsReview": True,
                        "paymentMethod": "CASH", "status": "COMPLETED"
                    }
                ]
            }
            page.route("**/api/transactions", lambda route: route.fulfill(
                status=200, content_type="application/json", body=str(mock_transactions).replace("'", '"').replace("True", "true").replace("False", "false")
            ))

            # Enter PIN
            page.get_by_role("button", name="1").click()
            page.get_by_role("button", name="2").click()
            page.get_by_role("button", name="3").click()
            page.get_by_role("button", name="4").click()

            # Wait for dashboard
            expect(page.get_by_text("Inicio", exact=True)).to_be_visible()
            print("Dashboard reached.")

            page.screenshot(path="verification/0_dashboard_check.png")

        # 2. Check Notification
        # Target the specific badge in BottomNavbar to avoid strict mode violations
        # BottomNavbar is fixed at bottom.

        # Using a locator chained to the bottom navbar container
        navbar = page.locator(".fixed.bottom-0")
        badge = navbar.get_by_text("1", exact=True)

        expect(badge).to_be_visible()
        print("Notification badge found.")
        page.screenshot(path="verification/1_badge.png")

        # Click it
        badge.click()

        # 3. Popup
        expect(page.get_by_text("Atención Requerida")).to_be_visible()
        page.screenshot(path="verification/2_popup.png")

        # 4. Action
        page.get_by_role("button", name="Revisar Ahora").click()

        # 5. History View
        # Wait for navigation
        expect(page.get_by_text("Gasto Rápido Test")).to_be_visible()
        page.screenshot(path="verification/3_history.png")

        # 6. Edit
        page.get_by_text("Gasto Rápido Test").click()
        expect(page.get_by_text("Editar / Revisar")).to_be_visible()
        page.screenshot(path="verification/4_edit.png")

        # 7. Close Edit
        page.locator("button:has(svg.lucide-x)").first.click() # Close X

        # 8. Check Menu (SideDrawer)
        # Verify "Agenda" is in BottomNavbar (Calendar icon)
        expect(navbar.get_by_text("Agenda")).to_be_visible()

        # Open Drawer
        navbar.get_by_text("Más").click()

        # Check Analysis Link
        drawer = page.locator(".fixed.inset-y-0.right-0") # Drawer container
        expect(drawer).to_be_visible()
        expect(drawer.get_by_text("Análisis y Estadísticas")).to_be_visible()

        print("SideDrawer Navigation verified.")
        page.screenshot(path="verification/5_menu.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
