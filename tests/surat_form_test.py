"""Check read-only task days without saving or changing archived letters.

Run: python3 -m unittest discover -s tests -p '*_test.py'
Requires the local preview and a managed browser session.
"""
import json
import os
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright


class TaskDayTests(unittest.TestCase):
    def setUp(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 1800})
        cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")
        if cookies_json:
            cookies = json.loads(cookies_json)
            for cookie in cookies:
                cookie["url"] = "http://localhost:8080"
            self.context.add_cookies(cookies)
        self.page = self.context.new_page()
        self.page.goto("http://localhost:8080")
        key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        session = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        if key and session:
            self.page.evaluate("([key, session]) => localStorage.setItem(key, session)", [key, session])
        self.page.goto("http://localhost:8080/surat/2309ecaa-c1f6-497c-a5d0-cbde34d69c30/edit")
        self.page.get_by_label("Hari mulai tugas", exact=True).wait_for()

    def tearDown(self):
        self.browser.close()
        self.playwright.stop()

    def check_day(self, day_label, date_label, date, expected):
        day = self.page.get_by_label(day_label, exact=True)
        self.assertTrue(day.evaluate("input => input.readOnly"))
        self.page.get_by_label(date_label, exact=True).fill(date)
        self.assertEqual(day.input_value(), expected)
        day.focus()
        self.page.keyboard.press("ControlOrMeta+A")
        self.page.keyboard.type("Ubah hari")
        self.assertEqual(day.input_value(), expected)

    def test_start_day_cannot_be_edited(self):
        self.check_day("Hari mulai tugas", "Tanggal mulai tugas", "2026-10-11", "Minggu")
        Path("/tmp/browser/task-days").mkdir(parents=True, exist_ok=True)
        self.page.screenshot(path="/tmp/browser/task-days/form.png")

    def test_end_day_cannot_be_edited(self):
        self.check_day("Hari selesai tugas", "Tanggal selesai tugas", "2026-10-12", "Senin")


if __name__ == "__main__":
    unittest.main()