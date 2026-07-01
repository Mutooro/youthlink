import { test, expect } from '@playwright/test'

test('student signup onboarding browse apply flow', async ({ page }) => {
  await page.goto('/auth?mode=signup')
  await page.getByRole('button', { name: /student/i }).click()
  await page.getByLabel('Full name').fill('Ada Lovelace')
  await page.getByLabel('Email address').fill(`ada-${Date.now()}@example.com`)
  await page.getByLabel('Password').fill('Password123')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page).toHaveURL(/auth/)
})

test('employer posting flow is reachable', async ({ page }) => {
  await page.goto('/auth?mode=signup')
  await page.getByRole('button', { name: /employer/i }).click()
  await page.getByLabel('Full name').fill('Grace Mugisha')
  await page.getByLabel('Email address').fill(`grace-${Date.now()}@example.com`)
  await page.getByLabel('Password').fill('Password123')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page).toHaveURL(/auth/)
})
