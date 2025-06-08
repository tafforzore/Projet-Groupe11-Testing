import { test, expect } from '@playwright/test';


test('vérifie la page', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Propelize/);
});
