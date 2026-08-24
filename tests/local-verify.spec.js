const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765';

test.describe('Local site verification', () => {
  test('homepage loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/index.html`);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/service.html`);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('.page-hero')).toBeVisible();
  });

  test('services nav link works from homepage', async ({ page }) => {
    await page.goto(`${BASE}/index.html`);
    const link = page.locator('a[href*="service.html"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/service\.html/);
  });

  test('accordion expands on services page', async ({ page }) => {
    await page.goto(`${BASE}/service.html`);
    const header = page.locator('h3[onclick*="toggleCategory"]').first();
    await expect(header).toBeVisible();
    const card = page.locator('.svc-card').nth(1);
    await expect(card).not.toHaveClass(/open/);
    await card.locator('h3').click();
    await expect(card).toHaveClass(/open/);
  });

  test('gender filter buttons exist', async ({ page }) => {
    await page.goto(`${BASE}/service.html`);
    const group = page.locator('.gender-filter');
    await expect(group).toBeVisible();
    await expect(group.locator('.gf-btn')).toHaveCount(4);
    await expect(group.locator('[data-gender="female"]')).toBeVisible();
    await expect(group.locator('[data-gender="male"]')).toBeVisible();
  });
});

