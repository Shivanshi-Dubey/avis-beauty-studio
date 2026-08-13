const { test, expect } = require('@playwright/test');

test('Login page opens', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca/login.html');

  await expect(page).toHaveURL(/login/);

  await expect(page.locator('body')).toBeVisible();

});