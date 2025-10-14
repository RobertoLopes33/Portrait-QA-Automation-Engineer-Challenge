import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { resetApplicationData, loginAsAdmin, generateTestProduct } from '../helpers/test-helpers'
import testData from '../../data/test-products.json'

/**
 * EXAMPLE TEST SUITE
 * This demonstrates a complete product lifecycle test
 * showing good practices for the QA challenge
 */

test.describe('Product Lifecycle - Example', () => {
  test.beforeEach(async ({ page }) => {
    // Reset data before each test for isolation
    await resetApplicationData(page)

    // Login as admin for product management
    await loginAsAdmin(page)
  })

  test('Complete product lifecycle: Create → Edit → Adjust Stock → Delete', async ({ page }) => {
    // Generate unique test data
    const testProduct = generateTestProduct()

    // Step 1: Create a new product
    await test.step('Create new product', async () => {
      await page.goto('http://localhost:3000/products')
      await page.getByTestId('add-product-button').click()
      await expect(page).toHaveURL('http://localhost:3000/products/new')

      // Fill product form
      await page.getByTestId('sku-input').fill(testProduct.sku)
      await page.getByTestId('name-input').fill(testProduct.name)
      await page.getByTestId('description-input').fill(testProduct.description)
      await page.getByTestId('price-input').fill(testProduct.price.toString())
      await page.getByTestId('stock-input').fill(testProduct.stock.toString())
      await page.getByTestId('category-input').selectOption(testProduct.category)
      await page.getByTestId('threshold-input').fill(testProduct.lowStockThreshold.toString())

      await page.getByTestId('save-button').click()
      await expect(page).toHaveURL('http://localhost:3000/products')

      // Verify product appears in the list
      await page.getByTestId('search-input').fill(testProduct.sku)
      await expect(page.locator('body > div.min-h-screen.bg-gray-50 > main > div > div.bg-white.shadow.overflow-hidden.sm\\:rounded-lg > table > tbody > tr > td.px-6.py-4.whitespace-nowrap.text-sm.font-medium.text-gray-900')).toContainText(testProduct.sku)
      await expect(page.locator('body > div.min-h-screen.bg-gray-50 > main > div > div.bg-white.shadow.overflow-hidden.sm\\:rounded-lg > table > tbody > tr > td:nth-child(2)')).toContainText(testProduct.name)
    })

    // Step 2: Search for the product
    await test.step('Search for created product', async () => {
      await page.getByTestId('search-input').fill(testProduct.name)

      // Verify only our product is shown
      const productRows = page.locator('[data-testid^="product-row-"]')
      await expect(productRows).toHaveCount(1)
      await expect(productRows.first()).toContainText(testProduct.name)
    })

    // Step 3: Edit the product
    await test.step('Edit product details', async () => {
      // Find the product ID from the edit button's href
      const editButton = page.locator(`[data-testid^="edit-product-"]`).first()
      await editButton.click()

      // Update product details
      const newName = `${testProduct.name} - Updated`
      await page.getByTestId('name-input').fill(newName)
      await page.getByTestId('price-input').fill('999.99')
      await page.getByTestId('save-button').click()

      // Verify updates
      await expect(page).toHaveURL('http://localhost:3000/products')
      await expect(page.getByText(newName)).toBeVisible()
      await expect(page.getByText('$999.99')).toBeVisible()
    })

    // Step 4: Adjust inventory stock
    await test.step('Adjust product stock', async () => {
      await page.goto('http://localhost:3000/inventory')

      // Find our product and adjust stock
      const adjustButton = page.getByTestId(`adjust-stock-${testProduct.sku}`)
      await adjustButton.click()

      // Increase stock by 10
      await page.getByTestId('adjustment-input').fill('10')
      await page.getByTestId('confirm-adjust-button').click()

      // Verify stock was updated
      const newStock = testProduct.stock + 10
      await expect(page.getByTestId(`inventory-row-${testProduct.sku}`)).toContainText(newStock.toString());
    })

    // Step 5: Delete the product
    await test.step('Delete product', async () => {
      await page.goto('http://localhost:3000/products')

      // Search for our product again
      await page.getByTestId('search-input').fill(testProduct.name)

      // Delete it
      const deleteButton = page.locator(`[data-testid^="delete-product-"]`).first()
      await deleteButton.click()

      // Confirm deletion in modal
      await page.getByTestId('confirm-delete-button').click()

      // Verify product is gone
      await page.getByTestId('search-input').fill('')
      await expect(page.getByTestId(`product-row-${testProduct.sku}`)).not.toBeVisible()
    })
  })

  test('Verify low stock alerts', async ({ page }) => {
    await test.step('Create product with low stock', async () => {
      await page.goto('http://localhost:3000/products/new')

      // Create product with stock below threshold
      await page.getByTestId('sku-input').fill('LOW-STOCK-001')
      await page.getByTestId('name-input').fill('Low Stock Product')
      await page.getByTestId('description-input').fill('Product with low inventory')
      await page.getByTestId('price-input').fill('50.00')
      await page.getByTestId('stock-input').fill('3')
      await page.getByTestId('category-input').selectOption('Electronics')
      await page.getByTestId('threshold-input').fill('10')

      await page.getByTestId('save-button').click()
    })

    await test.step('Verify low stock indicators', async () => {
      // Check products page
      await page.goto('http://localhost:3000/products')
      await page.getByTestId('search-input').fill('Low Stock Product')

      const stockBadge = page.getByTestId('product-row-LOW-STOCK-001')
      await expect(stockBadge).toContainText('3')

      // Check inventory page
      await page.goto('http://localhost:3000/inventory')
      await expect(page.getByTestId('low-stock-alert')).toBeVisible()
    })
  })

  test('Data-driven product creation from test data', async ({ page }) => {
    // Use test data from JSON file
    for (const product of testData.validProducts) {
      await test.step(`Create product: ${product.name}`, async () => {
        await page.goto('http://localhost:3000/products/new')

        await page.getByTestId('sku-input').fill(product.sku)
        await page.getByTestId('name-input').fill(product.name)
        await page.getByTestId('description-input').fill(product.description)
        await page.getByTestId('price-input').fill(product.price.toString())
        await page.getByTestId('stock-input').fill(product.stock.toString())
        await page.getByTestId('category-input').selectOption(product.category)
        await page.getByTestId('threshold-input').fill(product.lowStockThreshold.toString())

        await page.getByTestId('save-button').click()
        await expect(page).toHaveURL('http://localhost:3000/products/new')

        // Verify product was created
        await page.goto('http://localhost:3000/products')
        await page.getByTestId('search-input').fill(product.sku)
        await expect(page.getByTestId(`product-row-${product.sku}`)).toContainText(product.sku)
        await expect(page.getByTestId(`product-row-${product.sku}`)).toContainText(product.name)
      })
    }
  })
})

test.describe('Form Validation - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await resetApplicationData(page)
    await loginAsAdmin(page)
    await page.goto('http://localhost:3000/products/new')
  })

  test('Should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('save-button').click()

    // Check for validation errors
    await expect(page.getByTestId('product-form')).toContainText('SKU is required')
    await expect(page.getByTestId('product-form')).toContainText('Name is required')
    await expect(page.getByTestId('product-form')).toContainText('Price is required')
    await expect(page.getByTestId('product-form')).toContainText('Stock is required')
  })

  test('Should validate negative values', async ({ page }) => {
    await page.getByTestId('sku-input').fill('TEST-NEG')
    await page.getByTestId('name-input').fill('Test Product')
    await page.getByTestId('price-input').fill('-10')
    await page.getByTestId('stock-input').fill('-5')

    await page.getByTestId('save-button').click()

    // Check for validation errors
    await expect(page.locator('body > div.min-h-screen.bg-gray-50 > main > div > form > div.grid.grid-cols-2.gap-4 > div:nth-child(5) > p')).toContainText('Price must be greater than 0')
    await expect(page.locator('body > div.min-h-screen.bg-gray-50 > main > div > form > div.grid.grid-cols-2.gap-4 > div:nth-child(6) > p')).toContainText('Stock cannot be negative')
  })
})