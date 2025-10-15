import { Page, Locator } from '@playwright/test'
import { generateTestProduct } from '../tests/helpers/test-helpers'

export class ProductsPage {
    readonly page: Page
    readonly btnAddProduct: Locator
    readonly searchInput: Locator
    readonly categoryFilter: Locator
    readonly sortSelect: Locator
    readonly inputSKU: Locator
    readonly inputName: Locator
    readonly inputDescription: Locator
    readonly inputPrice: Locator
    readonly inputStock: Locator
    readonly inputCategory: Locator
    readonly inputThreshold: Locator
    readonly btnCancel: Locator
    readonly btnSave: Locator
    readonly btnConfirmDelete: Locator

    
    constructor(page: Page) {
        this.page = page
        this.btnAddProduct = page.getByTestId('add-product-button')
        this.searchInput = page.getByTestId('search-input')
        this.categoryFilter = page.getByTestId('category-filter')
        this.sortSelect = page.getByTestId('sort-select')
        this.inputSKU = page.getByTestId('sku-input')
        this.inputName = page.getByTestId('name-input')
        this.inputDescription = page.getByTestId('description-input')
        this.inputPrice = page.getByTestId('price-input')
        this.inputStock = page.getByTestId('stock-input')
        this.inputCategory = page.getByTestId('category-input')
        this.inputThreshold = page.getByTestId('threshold-input')
        this.btnCancel = page.getByTestId('cancel-button')
        this.btnSave = page.getByTestId('save-button')
        this.btnConfirmDelete = page.getByTestId('confirm-delete-button')
    }

    async goto() {
        await this.page.goto(`${process.env.BASE_URL}/products`)
    }

    async createNewProduct(category?: String, price?: string, stock?: string): Promise<{ sku: string, name: string }> {
        const testProduct = generateTestProduct()

        // Navegate to new product page and wait for element to be visible
        await this.btnAddProduct.click()
        await this.inputSKU.waitFor({ state: 'visible' })

        await this.inputSKU.fill(testProduct.sku)
        await this.inputName.fill(testProduct.name)
        await this.inputDescription.fill(testProduct.description)
        await this.inputPrice.fill(price || testProduct.price.toString())
        await this.inputStock.fill(stock || testProduct.stock.toString())
        await this.inputCategory.selectOption(category || testProduct.category)
        await this.inputThreshold.fill(testProduct.lowStockThreshold.toString())
        await this.btnSave.click()

        return {
            sku: testProduct.sku,
            name: testProduct.name
        }
    }

    async clickOnEditProduct(sku: string) {
        await this.page.getByTestId(`edit-product-${sku}`).click()
    }

    async clickOnDeleteProduct(sku: string) {
        await this.page.getByTestId(`delete-product-${sku}`).click()
    }

    async getProductRow(sku: string) {
        return this.page.getByTestId(`product-row-${sku}`)
    }
}