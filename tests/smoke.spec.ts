import { expect, test } from "@playwright/test"

// Requires a seeded database: npm run db:seed
test("guest landing page", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Welcome to your professional community" })).toBeVisible()
})

test("wrong password shows a clear error", async ({ page }) => {
  await page.goto("/login")
  await page.waitForLoadState("networkidle")
  await page.fill("#email", "demo@workvine.dev")
  await page.fill("#password", "not-the-password")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  // Better Auth rate-limits repeated failures, so either message is a correct outcome.
  await expect(page.locator("p[role=alert]")).toContainText(/don't match|Too many attempts/)
})

test("demo user can browse every section", async ({ page }) => {
  await page.goto("/login")
  await page.waitForLoadState("networkidle") // wait for hydration before clicking
  await page.getByRole("button", { name: "Try the demo account" }).click()
  await page.waitForURL("**/feed")
  await expect(page.locator("article").first()).toBeVisible()

  // Feed is virtualized: far fewer posts are mounted than are loaded.
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 2500)
  expect(await page.locator("article").count()).toBeLessThan(25)

  await page.goto("/mynetwork")
  await expect(page.getByText("People you may know")).toBeVisible()
  await page.goto("/jobs")
  await expect(page.getByText(/Top job picks|Jobs matching/)).toBeVisible()
  await page.goto("/messaging")
  await expect(page.getByRole("heading", { name: "Messaging" })).toBeVisible()
  await page.goto("/notifications")
  await expect(page.getByRole("region", { name: "Notifications", exact: true })).toBeVisible()

  // Revisiting a page renders from cache: no skeletons.
  await page.goto("/feed")
  await expect(page.locator("article").first()).toBeVisible()
  await page.goto("/jobs")
  await page.goto("/feed")
  await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0)
})
