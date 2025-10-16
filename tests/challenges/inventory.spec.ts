import { Page, test, expect } from '@playwright/test'
import { InventoryPage } from '../../pages/inventory.page'
import { ProductsPage } from '../../pages/products.page'
import { resetApplicationData, loginAsAdmin } from '../helpers/test-helpers'
import { products } from '../../data/products.json'

test.describe('Invetory [Inventory]', async () => {
    test.beforeEach(async ({ page }) => {
        await resetApplicationData(page)

        await loginAsAdmin(page)
    })

    test('Increase stock level', async ({ page }) => {
        let productTest: {sku: String}
        let productTestStock: String
        const inventoryPage = new InventoryPage(page)

        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTest = await productsPage.createNewProduct()
        })

        await test.step('Increase stock level', async () => {
            await inventoryPage.goto()
            productTestStock = await inventoryPage.getInventoryProductStock(productTest.sku)
            await inventoryPage.clickOnAdjustStock(productTest.sku)
            await inventoryPage.adjustmentInput.fill('10')
            await inventoryPage.btnConfirmAdjust.click()
        })

        await test.step('Verify stock', async () => {
            await inventoryPage.page.waitForURL(`${process.env.BASE_URL}/inventory`)
            const productNewStock = await inventoryPage.getInventoryProductStock(productTest.sku)
            expect(productNewStock).toBe(`${Number(productTestStock) + 10}`)
        })
    })

    test('Decrease stock level', async ({ page }) => {
        let productTest: {sku: String}
        let productTestStock: String
        const inventoryPage = new InventoryPage(page)

        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTest = await productsPage.createNewProduct()
        })

        await test.step('Increase stock level', async () => {
            await inventoryPage.goto()
            productTestStock = await inventoryPage.getInventoryProductStock(productTest.sku)
            await inventoryPage.clickOnAdjustStock(productTest.sku)
            await inventoryPage.adjustmentInput.fill('-1')
            await inventoryPage.btnConfirmAdjust.click()
        })

        await test.step('Verify stock', async () => {
            await inventoryPage.page.waitForURL(`${process.env.BASE_URL}/inventory`)
            const productNewStock = await inventoryPage.getInventoryProductStock(productTest.sku)
            expect(productNewStock).toBe(`${Number(productTestStock) - 1}`)
        })
    })

    test('Validate required field on stock adjustment', async ({ page }) => {
        let productTest: {sku: String}
        const inventoryPage = new InventoryPage(page)

        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTest = await productsPage.createNewProduct()
        })

        await test.step('Try to adjust stock without value', async () => {
            await inventoryPage.goto()
            await inventoryPage.clickOnAdjustStock(productTest.sku)
            await inventoryPage.btnConfirmAdjust.click()
            await expect(inventoryPage.page.getByTestId('adjustment-error')).toBeVisible()
            await expect(inventoryPage.page.getByTestId('adjustment-error')).toHaveText('Please enter a valid number')
        })
    })

    test('Verify low stock alert', async ({ page }) => {
        const inventoryPage = new InventoryPage(page)
        await inventoryPage.goto()
        await inventoryPage.page.waitForURL(`${process.env.BASE_URL}/inventory`)
        await expect(inventoryPage.lowStockAlert).toBeVisible()
        await expect(inventoryPage.lowStockAlert).toContainText(' are running low on stock')
    })

    test('Verify product status (In Stock, Medium, Low Stock)', async ({ page }) => {
        let productTestInStock: {sku: String}
        let productTestMediumStock: {sku: String}
        let productTestLowStock: {sku: String}
        let productTestStatus: String
        const inventoryPage = new InventoryPage(page)

        await test.step('Create new products', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTestInStock = await productsPage.createNewProduct(undefined, undefined, '21')
            productTestMediumStock = await productsPage.createNewProduct(undefined, undefined, '20')
            productTestLowStock = await productsPage.createNewProduct(undefined, undefined, '5')
        })

        await test.step('Verify product with In Stock status', async () => {
            await inventoryPage.goto()
            productTestStatus = await inventoryPage.getInventoryProductStatus(productTestInStock.sku)
            expect(productTestStatus).toBe('In Stock')
        })

        await test.step('Verify product with Medium Stock status', async () => {
            productTestStatus = await inventoryPage.getInventoryProductStatus(productTestMediumStock.sku)
            expect(productTestStatus).toBe('Medium')
        })

        await test.step('Verify product with Low Stock status', async () => {
            productTestStatus = await inventoryPage.getInventoryProductStatus(productTestLowStock.sku)
            expect(productTestStatus).toBe('Low Stock')
        })
        
    })

    test('Validate low stock product alert counter', async ({ page }) => {
        const inventoryPage = new InventoryPage(page)
        
        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            await productsPage.createNewProduct(undefined, undefined, '5')
        })

        // By default 2 products are with status low stock, adding 1 mode product should show that 3 products are running low on stock
        await test.step('Verify low stock alert counter', async () => {
            await inventoryPage.goto()
            await expect(inventoryPage.lowStockAlert).toBeVisible()
            await expect(inventoryPage.lowStockAlert).toHaveText('3 products are running low on stock')
        })
    })

    test('Verify if new product appear on inventory list', async ({ page }) => {
        let productTest: {sku: String, name: String}
        
        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTest = await productsPage.createNewProduct()
        })

        await test.step('Verify Inventory table', async () => {
            const inventoryPage = new InventoryPage(page)
            await inventoryPage.goto()
            const inventoryRow = await inventoryPage.getInventoryRow(productTest.sku)
            await expect(inventoryRow).toBeVisible()
            await expect(inventoryRow).toContainText(`${productTest.sku}${productTest.name}`)
        })
    })

    test('Update stock for 10 products in sequence', async ({ page }) => {
        const inventoryPage = new InventoryPage(page)
        const productsPage = new ProductsPage(page)
        
        await test.step('Create 10 products', async () => {
            await productsPage.goto()
            for(const product of products) {
                await productsPage.btnAddProduct.click()
                await productsPage.inputSKU.fill(product.sku)
                await productsPage.inputName.fill(product.name)
                await productsPage.inputDescription.fill(product.description)
                await productsPage.inputCategory.selectOption(product.category)
                await productsPage.inputPrice.fill(product.price.toString())
                await productsPage.inputStock.fill(product.stockQuantity.toString())
                await productsPage.inputThreshold.fill(product.lowStockThreshold.toString())
                await productsPage.btnSave.click()
                await productsPage.page.waitForURL(`${process.env.BASE_URL}/products`)
            }
        })

        await test.step('Update stock for 10 products', async () => {
            await inventoryPage.goto()
            for(const product of products) {
                await inventoryPage.clickOnAdjustStock(product.sku)
                await inventoryPage.adjustmentInput.fill('10')
                await inventoryPage.btnConfirmAdjust.click()
                await inventoryPage.page.waitForURL(`${process.env.BASE_URL}/inventory`)
                const productNewStock = await inventoryPage.getInventoryProductStock(product.sku)
                expect(productNewStock).toBe(`${Number(product.stockQuantity) + 10}`)
            }
        })
    })

    test('Negative - Set product stock below 0', async ({ page }) => {
        const inventoryPage = new InventoryPage(page)
        let productTest: {sku: String}

        await test.step('Create new product', async () => {
            const productsPage = new ProductsPage(page)
            await productsPage.goto()
            productTest = await productsPage.createNewProduct()
        })

        await test.step('Try to set stock below 0', async () => {
            await inventoryPage.goto()
            await inventoryPage.clickOnAdjustStock(productTest.sku)
            await inventoryPage.adjustmentInput.fill('-100')
            await inventoryPage.btnConfirmAdjust.click()
            await expect(inventoryPage.page.getByTestId('adjustment-error')).toBeVisible()
            await expect(inventoryPage.page.getByTestId('adjustment-error')).toHaveText('Stock cannot be negative')
        })
    })
})