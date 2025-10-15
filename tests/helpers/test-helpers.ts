import { Page } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'

/**
 * Reset application data to default state
 * Useful for test isolation and cleanup
 */
export async function resetApplicationData(page: Page) {
  // Call the reset API endpoint
  await page.request.post('http://localhost:3000/api/reset')

  await page.goto('http://localhost:3000/login')

  // Clear localStorage to reset client-side data
  await page.evaluate(() => {
    localStorage.clear()
  })

  // Reload to apply changes
  await page.reload()
}

/**
 * Login helper for quick authentication in tests
 */
export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page)
  await loginPage.loginAsAdmin()
}

/**
 * Login helper for regular user
 */
export async function loginAsUser(page: Page) {
  const loginPage = new LoginPage(page)
  await loginPage.loginAsUser()
}

/**
 * Wait for a specific element to be visible and stable
 */
export async function waitForElement(page: Page, testId: string) {
  const element = page.getByTestId(testId)
  await element.waitFor({ state: 'visible' })
  await element.waitFor({ state: 'attached' })
  return element
}

/**
 * Generate unique test data
 */
export function generateTestProduct() {
  const timestamp = Date.now()
  return {
    sku: `TEST-${timestamp}`,
    name: `Test Product ${timestamp}`,
    description: `Automated test product created at ${new Date().toISOString()}`,
    price: Math.floor(Math.random() * 900 + 100), // Random price between 100-1000
    stock: Math.floor(Math.random() * 100 + 1), // Random stock between 1-100
    category: ['Electronics', 'Hardware', 'Software', 'Accessories'][Math.floor(Math.random() * 4)] as any,
    lowStockThreshold: 10
  }
}