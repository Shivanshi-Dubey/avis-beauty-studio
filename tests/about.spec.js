const { test, expect } = require('@playwright/test');

test('About page opens', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca/about.html');

  await expect(page).toHaveURL(/about/);

  await expect(page.locator('body')).toBeVisible();

});