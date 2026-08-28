import { Page } from "@playwright/test"

export class ViewSwitcherPageObject {
    constructor(private page: Page) {}

    async switchToDomain() {
        await this.page.locator("[data-testid=view-switcher-domain]").click()
    }

    async switchToMetrics() {
        await this.page.locator("[data-testid=view-switcher-metrics]").click()
    }

    /** Picking a tab closes the mode bar, so the pointer has to leave before it can hover it open again. */
    async hoverMetricsTab() {
        await this.page.mouse.move(0, 0)
        await this.page.locator("[data-testid=view-switcher-metrics]").hover()
    }

    /** The handle sits below the nav bar, so the pointer has to start off it to hover it open. */
    async hoverDrawerHandle() {
        await this.page.mouse.move(0, 0)
        await this.page.locator("[data-testid=view-mode-bar-handle]").hover()
    }

    isDomainOptionVisible() {
        return this.page.locator("[data-testid=view-switcher-domain]").isVisible()
    }

    isVisible() {
        return this.page.locator("[data-testid=view-switcher]").isVisible()
    }

    modeBar() {
        return this.page.locator("[data-testid=view-mode-bar-overlay]")
    }
}
