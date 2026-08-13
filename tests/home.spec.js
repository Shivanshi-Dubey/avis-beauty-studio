const { test, expect } = require('@playwright/test');

test('Homepage loads successfully', async ({ page }) => {
  await page.goto('https://avisbeautystudio.ca');

  await expect(page).toHaveTitle(/Avi/i);
  await expect(page.locator('body')).toBeVisible();

  await page.screenshot({
    path: 'screenshots/homepage.png',
    fullPage: true
  });
});