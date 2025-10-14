import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
    readonly page: Page
    readonly navDashboard: Locator
    readonly navProducts: Locator
    readonly navInventory: Locator
    readonly btnLogout: Locator

    constructor(page: Page) {
        this.page = page
        this.navDashboard = page.getByTestId('nav-dashboard')
        this.navProducts = page.getByTestId('nav-products')
        this.navInventory = page.getByTestId('nav-inventory')
        this.btnLogout = page.getByTestId('logout-button')
    }

    async goto() {
        await this.page.goto(`${process.env.BASE_URL}/dashboard`)

        await this.page.waitForURL(`${process.env.BASE_URL}/dashboard`)
    }

    async logout() {
        await this.btnLogout.click()
        await this.page.waitForURL(`${process.env.BASE_URL}/login`)
    }

    async getTotalProducts() {
        return await this.page.getByTestId('stat-total-products').getByRole('definition').innerText()
    }

    async getTotalLowStockProducts() {
        return await this.page.getByTestId('stat-low-stock').getByRole('definition').innerText()
    }

    async getTotalValue() {
        return await this.page.getByTestId('stat-total-value').getByRole('definition').innerText()
    }

    // *Not Working - This method depends of the implementation of the recent activities table and the css selectors
    async getRecentActivities(): Promise<{ action: string; item: string; time: string }[]> {
        // Need to implement this locator
        const activityRows = await this.page.locator('css=[data-testid="recent-activity-row"]').all()
      
        const activities = []
      
        for (const row of activityRows) {
          // Need to implement this locator
          const actionText = await row.locator('.activity-action').innerText()
          const itemText = await row.locator('.activity-item').innerText()
          const timeText = await row.locator('.activity-time').innerText()
      
          activities.push({
            action: actionText.trim(),
            item: itemText.trim(),
            time: timeText.trim(),
          })
        }
      
        return activities
      }
}