import { test as base, Page } from '@playwright/test'

interface ErrorRequest {
    url: string
    status: number
}

export const test = base.extend<{ pageWithMonitoring: Page }>({
    pageWithMonitoring: [async ({ page }, use, testInfo) => {
        // setup
        const failedRequests: ErrorRequest[] = []

        page.on("response", (response) => {
            const url = response.url()
            const status = response.status()
            if(status >= 400) {
                failedRequests.push({
                    url,
                    status
                })
            }
        })
        await use(page)
        // teardown
        await testInfo.attach("failed-requests.json", {
            body: JSON.stringify(failedRequests, null, 2),
            contentType: "application/json"
        })
        if(failedRequests.length > 0) {
            throw new Error('There were failed requests in this test')
        }

    }, { auto: true }], 
})

export { expect } from '@playwright/test'