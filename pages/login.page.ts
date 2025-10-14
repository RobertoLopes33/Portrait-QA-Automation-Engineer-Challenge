import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly passwordToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByTestId('email-input')
    this.passwordInput = page.getByTestId('password-input')
    this.loginButton = page.getByTestId('login-button')
    this.errorMessage = page.getByTestId('error-message')
    this.passwordToggle = page.getByTestId('password-toggle')
  }

  async goto() {
    await this.page.goto(`${process.env.BASE_URL}/login`)

    // Ensure the application is loaded
    await this.page.waitForURL(`${process.env.BASE_URL}/login`)
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async loginAsAdmin() {
    await this.emailInput.fill(process.env.ADMIN_EMAIL!)
    await this.passwordInput.fill(process.env.ADMIN_PASSWORD!)
    await this.loginButton.click()
  }

  async loginAsUser() {
    await this.emailInput.fill(process.env.USER_EMAIL!)
    await this.passwordInput.fill(process.env.USER_PASSWORD!)
    await this.loginButton.click()
  }

  // TODO: Candidates should implement these methods
  async isPasswordVisible() {
    await expect(this.passwordInput).toHaveAttribute('type', 'text')
    return true
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click()
    await expect(this.passwordInput).toBeVisible()
  }

  async getErrorMessage() {
    await this.errorMessage.waitFor({ state: 'visible' })
    return await this.errorMessage.innerText()
  }
}