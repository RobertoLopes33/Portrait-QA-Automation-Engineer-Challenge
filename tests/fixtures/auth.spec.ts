import { test as setup, expect } from './base'
import { LoginPage } from '@/pages/login.page'
import { resetApplicationData } from '../helpers/test-helpers'
import path from 'path'
import fs from 'fs'

const authDir = path.join(__dirname, '../../.auth');
const authFile = path.join(__dirname, '../../.auth/user.json')

setup('Authenticate as admin', async ({ page }) => {
    // Ensure auth directory exists
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    // Reset data before each test for isolation
    await resetApplicationData(page)

    // Login as admin
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.loginAsAdmin()
    await page.waitForURL(`${process.env.BASE_URL}/dashboard`)
    expect(page.url()).toContain('/dashboard')

    // Save auth state
    await page.context().storageState({ path: authFile })
})