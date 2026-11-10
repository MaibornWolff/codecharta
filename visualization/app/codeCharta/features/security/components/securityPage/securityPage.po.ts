import { Page } from "@playwright/test"

export class SecurityPagePageObject {
    constructor(private readonly page: Page) {}

    async open() {
        await this.page.getByTestId("view-switcher-security").click()
        await this.page.getByTestId("security-packages").waitFor()
    }

    rows() {
        return this.page.getByTestId("security-package-row")
    }

    row(name: string) {
        return this.rows().filter({ hasText: name })
    }
}
