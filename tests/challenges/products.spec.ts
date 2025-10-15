import { test, expect } from '@playwright/test'
import { ProductsPage } from '../../pages/products.page'
import { resetApplicationData, loginAsAdmin } from '../helpers/test-helpers'

test.describe('Products [Products]', async () => {
    test.beforeEach(async ({ page }) => {
        await resetApplicationData(page)

        await loginAsAdmin(page)
    })

    test('Validate products page components', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        // Elements of products page
        await expect(productsPage.btnAddProduct).toBeVisible()
        await expect(productsPage.searchInput).toBeVisible()
        await expect(productsPage.categoryFilter).toBeVisible()
        await expect(productsPage.sortSelect).toBeVisible()

        // Elements of new product page
        await productsPage.btnAddProduct.click()
        await expect(productsPage.inputSKU).toBeVisible()
        await expect(productsPage.inputName).toBeVisible()
        await expect(productsPage.inputDescription).toBeVisible()
        await expect(productsPage.inputPrice).toBeVisible()
        await expect(productsPage.inputStock).toBeVisible()
        await expect(productsPage.inputCategory).toBeVisible()
        await expect(productsPage.inputThreshold).toBeVisible()
        await expect(productsPage.btnCancel).toBeVisible()
        await expect(productsPage.btnSave).toBeVisible()
    })

    test('Search for product by SKU', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        const testProduct = await productsPage.createNewProduct()

        await productsPage.page.waitForURL(`${process.env.BASE_URL}/products`)
        await productsPage.searchInput.fill(testProduct.sku)
        
        const productRow = await productsPage.getProductRow(testProduct.sku)
        await expect(productRow).toBeVisible()
    })

    test('Search for product by Name', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        const testProduct = await productsPage.createNewProduct()
        await productsPage.page.waitForURL(`${process.env.BASE_URL}/products`)
        await productsPage.searchInput.fill(testProduct.name)

        const productRow = await productsPage.getProductRow(testProduct.sku)
        await expect(productRow).toBeVisible()
    })

    test('Filter Categories (Electronics, Accessories, Software, Hardware)', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        await test.step('Create products with different categories', async () => {
            await productsPage.createNewProduct('Electronics')
            await productsPage.createNewProduct('Accessories')
            await productsPage.createNewProduct('Software')
            await productsPage.createNewProduct('Hardware')
        })

        await test.step('Filter table products by Category', async () => {
            await productsPage.categoryFilter.selectOption('Electronics')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('Electronics')

            await productsPage.categoryFilter.selectOption('Accessories')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('Accessories')

            await productsPage.categoryFilter.selectOption('Software')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('Software')

            await productsPage.categoryFilter.selectOption('Hardware')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('Hardware')
        })
    })

    test('Sort table products (Name, Price, Stock)', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        await test.step('Sort table products by Name', async () => {
            await productsPage.sortSelect.selectOption('name')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('27" 4K Monitor')
        })

        await test.step('Sort table products by Price', async () => {
            await productsPage.sortSelect.selectOption('price')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('$19.99')
        })

        await test.step('Sort table products by Stock', async () => {
            await productsPage.sortSelect.selectOption('stock')
            await expect(productsPage.page.locator('[data-testid^="product-row-"]').first()).toContainText('2')
        })
    })

    test('Add new product', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        const productTest = await productsPage.createNewProduct()
        const productTestRow = await productsPage.getProductRow(productTest.sku)
        await expect(productTestRow).toContainText(productTest.sku)
        await expect(productTestRow).toContainText(productTest.name)
    })
    test('Validate required Field', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        await productsPage.btnAddProduct.click()
        await productsPage.btnSave.click()

        // Check for validation errors
        await expect(productsPage.page.getByTestId('product-form')).toContainText('SKU is required')
        await expect(productsPage.page.getByTestId('product-form')).toContainText('Name is required')
        await expect(productsPage.page.getByTestId('product-form')).toContainText('Price is required')
        await expect(productsPage.page.getByTestId('product-form')).toContainText('Stock is required')
    })

    test('Edit product', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        // Creating a new test product
        const productTest = await productsPage.createNewProduct()
        const productTestRow = await productsPage.getProductRow(productTest.sku)
        await expect(productTestRow).toContainText(productTest.sku)
        await expect(productTestRow).toContainText(productTest.name)

        // Editing the product
        await productsPage.clickOnEditProduct(productTest.sku)
        await productsPage.inputName.fill('Updated Product Name')
        await productsPage.inputPrice.fill('999.99')
        await productsPage.inputStock.fill('20')
        await productsPage.btnSave.click()

        // Verify product was updated
        await expect(productTestRow).toContainText('Updated Product Name')
        await expect(productTestRow).toContainText('$999.99')
        await expect(productTestRow).toContainText('20')
    })

    test('Delete product', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        // Creating a new test product
        const productTest = await productsPage.createNewProduct()
        const productTestRow = await productsPage.getProductRow(productTest.sku)
        await expect(productTestRow).toContainText(productTest.sku)
        await expect(productTestRow).toContainText(productTest.name)

        // Deleting the product
        await productsPage.clickOnDeleteProduct(productTest.sku)
        await productsPage.btnConfirmDelete.click()
        await expect(productTestRow).not.toBeVisible()
    })

    test('Negative - Add new product with price under 0', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        await productsPage.createNewProduct(undefined, '-100')
        await expect(productsPage.page.getByTestId('product-form')).toContainText('Price must be greater than 0')
    })

    test('Negative - Add new product with stock under 0', async ({ page }) => {
        const productsPage = new ProductsPage(page)
        await productsPage.goto()

        await productsPage.createNewProduct(undefined, undefined, '-100')
        await expect(productsPage.page.getByTestId('product-form')).toContainText('Stock cannot be negative')
    })
})