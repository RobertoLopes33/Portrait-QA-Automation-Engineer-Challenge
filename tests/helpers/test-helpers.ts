import { Page } from '@playwright/test'

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
  await page.goto('http://localhost:3000/login')
  await page.getByTestId('email-input').fill('admin@test.com')
  await page.getByTestId('password-input').fill('Admin123!')
  await page.getByTestId('login-button').click()
  await page.waitForURL('http://localhost:3000/dashboard')
}

/**
 * Login helper for regular user
 */
export async function loginAsUser(page: Page) {
  await page.goto('http://localhost:3000/login')
  await page.getByTestId('email-input').fill('user@test.com')
  await page.getByTestId('password-input').fill('User123!')
  await page.getByTestId('login-button').click()
  await page.waitForURL('http://localhost:3000/dashboard')
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