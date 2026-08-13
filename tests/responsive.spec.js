const { test, expect, devices } = require('@playwright/test');

test.use(devices['iPhone 13']);

test('Mobile View Test', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca');

  await expect(page.locator('body')).toBeVisible();

  await page.screenshot({
    path: 'screenshots/mobile.png'
  });

});