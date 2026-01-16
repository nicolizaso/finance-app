
from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate mobile for Bottom Nav and Side Drawer check
        # But also check desktop for layout.
        # I'll check Desktop first.
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Go to Home (Dashboard)
        page.goto("http://localhost:5173")

        # 2. Login flow (UserScreen)
        # Enter User
        page.fill('input[placeholder="Nombre de usuario"]', "TestUser")
        page.click('button:has-text("Continuar")')

        # Enter PIN (PinScreen)
        # Wait for "Hola, TestUser"
        page.wait_for_selector('text=Hola, TestUser')

        # Click 1, 2, 3, 4
        # Assuming keypad buttons have text 1, 2, 3, 4
        page.click('button:has-text("1")')
        page.click('button:has-text("2")')
        page.click('button:has-text("3")')
        page.click('button:has-text("4")')

        try:
            # Wait for dashboard (Look for content like "Gastos del Mes" or "Saldo Total")
            page.wait_for_selector('text=Gastos del Mes', timeout=10000)
        except Exception as e:
            print(f"Error waiting for dashboard: {e}")
            page.screenshot(path="verification/error_dashboard.png")
            raise e

        # Take screenshot of Dashboard (Desktop)
        page.screenshot(path="verification/dashboard_desktop.png")
        print("Dashboard Desktop screenshot taken.")

        # 3. Check navigation to History
        page.click('a[href="/history"]')
        page.wait_for_url("**/history")
        page.wait_for_selector('input[placeholder="Buscar movimientos..."]')
        page.screenshot(path="verification/history_desktop.png")
        print("History Desktop screenshot taken.")

        # 4. Check Stats
        page.click('a[href="/stats"]')
        page.wait_for_url("**/stats")
        page.wait_for_selector('text=Análisis Financiero')
        page.screenshot(path="verification/stats_desktop.png")

        # 5. Check Wealth (Assets)
        page.click('a[href="/wealth"]')
        page.wait_for_url("**/wealth")
        page.screenshot(path="verification/wealth_desktop.png")

        # 6. Check Planning
        page.click('a[href="/planning"]')
        page.wait_for_url("**/planning")
        page.screenshot(path="verification/planning_desktop.png")

        # --- MOBILE VERIFICATION ---
        context_mobile = browser.new_context(viewport={'width': 375, 'height': 812})
        page_mobile = context_mobile.new_page()

        # Login again for mobile context (storage is per context)
        page_mobile.goto("http://localhost:5173")
        page_mobile.fill('input[placeholder="Nombre de usuario"]', "MobileUser")
        page_mobile.click('button:has-text("Continuar")')

        # PIN
        page_mobile.wait_for_selector('text=Hola, MobileUser')
        page_mobile.click('button:has-text("1")')
        page_mobile.click('button:has-text("2")')
        page_mobile.click('button:has-text("3")')
        page_mobile.click('button:has-text("4")')

        page_mobile.wait_for_selector('text=Gastos del Mes')

        # Check Bottom Nav
        page_mobile.screenshot(path="verification/dashboard_mobile.png")
        print("Dashboard Mobile screenshot taken.")

        # Open Side Drawer
        page_mobile.click('text=Más') # "Más" button in BottomNav
        # Wait for drawer
        page_mobile.wait_for_selector('text=Cerrar Sesión')
        page_mobile.screenshot(path="verification/drawer_mobile.png")
        print("Drawer Mobile screenshot taken.")

        # Open Quick Add
        # Close drawer first (Click backdrop)
        page_mobile.mouse.click(10, 10)
        # Wait for drawer to close
        time.sleep(1)

        # Quick Add Button (Center)
        # It's the 3rd button (index 2) in nav. It has Plus icon.
        # I can find it by aria-label if I added one, or just by icon.
        # It doesn't have text label maybe?
        # My code: { icon: Plus, label: 'Quick Add', action: onQuickAdd, isMain: true }
        # It renders a button with Plus icon.
        # I'll try finding by role button and index or parent.
        # It has "Quick Add" label? No, label is not rendered for main button?
        # My code:
        # if (item.isMain) { return <button ...><item.icon size={28} /></button> }
        # It does NOT render the label text inside the button.
        # I'll select by class or structure.
        # It has `rounded-full bg-gradient-to-br`.
        # Select the Quick Add button in the bottom navbar (3rd button)
        # Force click because it might be partially obscured or animating
        page_mobile.locator(".fixed.bottom-0 button").nth(2).click(force=True)

        # Verify Modal
        page_mobile.wait_for_selector('text=Nuevo Movimiento')
        page_mobile.screenshot(path="verification/quickadd_mobile.png")
        print("Quick Add Mobile screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
