import { Page, Locator } from '@playwright/test'

export class InventoryPage {
    readonly page: Page
    readonly lowStockAlert: Locator
    readonly adjustmentInput: Locator
    readonly btnConfirmAdjust: Locator
    readonly btnCancelAdjust: Locator

    constructor(page: Page) {
        this.page = page
        this.lowStockAlert = page.getByTestId('low-stock-alert')
        this.adjustmentInput = page.getByTestId('adjustment-input')
        this.btnConfirmAdjust = page.getByTestId('confirm-adjust-button')
        this.btnCancelAdjust = page.getByTestId('cancel-adjust-button')
    }

    async goto() {
        this.page.goto(`${process.env.BASE_URL}/inventory`)
    }

    async clickOnAdjustStock(sku: String) {
        this.page.getByTestId(`adjust-stock-${sku}`).click()
    }

    async getInventoryRow(sku: String) {
        return this.page.getByTestId(`inventory-row-${sku}`)
    }

    async getInventoryProductStock(sku: String) {
        return this.page.getByTestId(`product-stock-${sku}`).innerText()
    }

    async getInventoryProductStatus(sku: String) {
        return this.page.getByTestId(`product-status-${sku}`).innerText()
    }
}