
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Desktop Context
    context_desktop = browser.new_context(viewport={'width': 1280, 'height': 720})

    # Mock API for Desktop
    def handle_login(route):
        print(f"Intercepted Login Request: {route.request.url}")
        route.fulfill(json={"success": True, "user": {"username": "Test User", "xp": 100, "streak": 5, "badges": []}})

    def handle_transactions(route):
        route.fulfill(json={"success": True, "data": []})

    def handle_profile(route):
        route.fulfill(json={"success": True, "user": {"username": "Test User", "xp": 100, "streak": 5, "badges": []}})

    context_desktop.route("**/api/users/login", handle_login)
    context_desktop.route("**/api/transactions", handle_transactions)
    context_desktop.route("**/api/users/profile", handle_profile)
    context_desktop.route("**/api/fixed-expenses/generate", lambda route: route.fulfill(json={"success": True}))
    context_desktop.route("https://dolarapi.com/v1/dolares", lambda route: route.fulfill(json=[]))

    page_desktop = context_desktop.new_page()

    # Mobile Context
    context_mobile = browser.new_context(viewport={'width': 375, 'height': 667})

    # Mock API for Mobile
    context_mobile.route("**/api/users/login", handle_login)
    context_mobile.route("**/api/transactions", handle_transactions)
    context_mobile.route("**/api/users/profile", handle_profile)
    context_mobile.route("**/api/fixed-expenses/generate", lambda route: route.fulfill(json={"success": True}))
    context_mobile.route("https://dolarapi.com/v1/dolares", lambda route: route.fulfill(json=[]))

    page_mobile = context_mobile.new_page()

    print("Navigating to app...")
    # Go to app (Desktop)
    page_desktop.goto("http://localhost:5173")

    # Login Flow (User Screen)
    print("Logging in (Desktop)...")
    # Check if we are at UserScreen or PinScreen (if local storage persisted?)
    # Contexts are new so local storage should be empty.
    page_desktop.get_by_placeholder("Nombre de usuario").fill("Test User")
    page_desktop.get_by_role("button", name="Continuar").click()

    # Pin Screen
    print("Entering PIN (Desktop)...")
    # Assuming PIN screen buttons are digits. "1", "2", "3", "4"
    for digit in ["1", "2", "3", "4"]:
        page_desktop.get_by_role("button", name=str(digit), exact=True).click()

    # Verify Dashboard loaded
    print("Waiting for Dashboard...")
    expect(page_desktop.get_by_role("link", name="Dashboard")).to_be_visible()

    # 1. Verify Calendar Link in Desktop Navbar
    print("Verifying Calendar Link...")
    # There might be 2 links because SideDrawer is also rendered in DOM but hidden?
    # Navbar.jsx (Top) and SideDrawer (Hidden)
    # We should scope to the header/navbar
    calendar_link = page_desktop.locator("header").get_by_role("link", name="Calendario")
    expect(calendar_link).to_be_visible()
    page_desktop.screenshot(path="verification/desktop_calendar_link.png")
    print("Screenshot desktop_calendar_link.png saved.")

    # Go to app (Mobile)
    print("Navigating to app (Mobile)...")
    page_mobile.goto("http://localhost:5173")

    # Login Flow (User Screen) - Mobile might share session if using same browser instance but contexts are isolated.
    # Need to login on mobile too.
    print("Logging in (Mobile)...")
    page_mobile.get_by_placeholder("Nombre de usuario").fill("Test User Mobile")
    page_mobile.get_by_role("button", name="Continuar").click()

    # Pin Screen
    print("Entering PIN (Mobile)...")
    for digit in ["1", "2", "3", "4"]:
        page_mobile.get_by_role("button", name=str(digit), exact=True).click()

    expect(page_mobile.locator("header").get_by_role("img", name="Logo")).to_be_visible()

    # 2. Verify Mobile Achievements
    print("Opening Drawer...")
    # Mobile header avatar to open drawer
    page_mobile.locator("header").locator("div.cursor-pointer").click()

    print("Clicking Logros...")
    logros_btn = page_mobile.get_by_role("button", name="Logros")
    expect(logros_btn).to_be_visible()
    logros_btn.click()

    print("Verifying Achievements Modal...")
    # Modal title: "Logros y Nivel"
    expect(page_mobile.get_by_text("Logros y Nivel")).to_be_visible()
    page_mobile.screenshot(path="verification/mobile_achievements.png")
    print("Screenshot mobile_achievements.png saved.")

    # Close modal
    # In AchievementsModal.jsx, the button has <X size={20} /> inside a button.
    # But SideDrawer also has an X button.
    # The modal is z-80, drawer is z-70. Modal is on top.
    # The modal close button is:
    # <button onClick={onClose} type="button" ...><X size={20} /></button>
    # It might not have text "X" accessible by name="X".
    # Playwright name logic for icons is tricky if they don't have aria-label.
    # Let's use locator for the modal and find button inside.
    modal = page_mobile.locator("text=Logros y Nivel").locator("..").locator("..") # Go up to container?
    # Or just click coordinates or use CSS selector.
    # The close button is in the header of the modal.
    # page_mobile.locator("button:has(svg.lucide-x)").last.click() # might pick drawer one

    # Click outside might work if backdrop handles click?
    # But better to find the button.
    # AchievementsModal structure:
    # <div ...> (Backdrop)
    #   <div ...> (Modal)
    #     <div ...> (Header)
    #        ...
    #        <button onClick={onClose} ...> <X /> </button>

    # We can try to click the backdrop or use a more specific selector.
    # Since modal is on top, `page_mobile.mouse.click(10, 10)` might click backdrop.

    print("Closing modal...")
    # Clicking the backdrop (top left corner safe?)
    page_mobile.mouse.click(10, 10)

    # Wait for modal to close
    expect(page_mobile.get_by_text("Logros y Nivel")).not_to_be_visible()

    # 3. Verify Export PDF
    print("Opening Drawer again...")
    page_mobile.locator("header").locator("div.cursor-pointer").click()

    print("Clicking Exportar PDF...")
    export_btn = page_mobile.get_by_role("button", name="Exportar PDF")
    expect(export_btn).to_be_visible()

    # We want to catch the loading state. It appears for 1 second.
    export_btn.click()
    print("Verifying Loading State...")
    loading_text = page_mobile.get_by_text("Generando Reporte PDF...")
    expect(loading_text).to_be_visible()
    page_mobile.screenshot(path="verification/mobile_pdf_loading.png")
    print("Screenshot mobile_pdf_loading.png saved.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
