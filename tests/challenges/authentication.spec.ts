import { test, expect } from '@playwright/test'
import { resetApplicationData } from '../helpers/test-helpers'
import { LoginPage } from '../../pages/login.page'
import { DashboardPage } from '../../pages/dashboard.page'

test.describe('Authentication [auth]', () => {
    test.beforeEach(async ({ page }) => {
        await resetApplicationData(page)
    })

    test('Login with valid user', async ({ page }) => {
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await loginPage.loginAsUser()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL('http://localhost:3000/dashboard')
    })

    test('Negative - Login with invalid user', async ({ page }) => {
        const loginPage = new LoginPage(page)
        await loginPage.login('invalid@test.com', 'invalid')
        await expect(loginPage.errorMessage).toBeVisible()
        await expect(await loginPage.getErrorMessage()).toBe('Invalid email or password')
    })

    test('Toggle password visibility', async ({ page }) => {
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await loginPage.togglePasswordVisibility()
        await expect(await loginPage.isPasswordVisible()).toBe(true)
    })

    test('Logout successfully', async ({ page }) => {
        await test.step('login as user', async() => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()
            await loginPage.loginAsUser()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL('http://localhost:3000/dashboard')
        })

        await test.step('logout', async() => {
            const dashboardPage = new DashboardPage(page)
            await dashboardPage.logout()
            await expect(page).toHaveURL('http://localhost:3000/login')
        })
    })
})