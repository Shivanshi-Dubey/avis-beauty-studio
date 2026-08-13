const { test, expect } = require('@playwright/test');

test('Services page opens', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca/service.html');

  await expect(page).toHaveURL(/service/);

  await expect(page.locator('body')).toBeVisible();

});