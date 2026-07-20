import { Page } from "@playwright/test"

export class ViewSwitcherPageObject {
    constructor(private page: Page) {}

    async switchToDomain() {
        await this.page.locator("[data-testid=view-switcher-domain]").click()
    }

    async switchToMetrics() {
        await this.page.locator("[data-testid=view-switcher-metrics]").click()
    }

    /** True only for the navigable option — the disabled stand-in carries a different test id. */
    isDomainOptionVisible() {
        return this.page.locator("[data-testid=view-switcher-domain]").isVisible()
    }

    isDomainOptionDisabled() {
        return this.page.locator("[data-testid=view-switcher-domain-unavailable]").isVisible()
    }

    isVisible() {
        return this.page.locator("[data-testid=view-switcher]").isVisible()
    }
}
