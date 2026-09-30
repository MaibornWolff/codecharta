import { Page } from "@playwright/test"

export class ViewSwitcherPageObject {
    constructor(private page: Page) {}

    async switchToDomain() {
        await this.switchTo("domain")
    }

    async switchToMetrics() {
        await this.switchTo("metrics")
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

    /** The view-switch spinner comes and goes under a resting pointer, which hovers the tab again and reopens the
     * mode bar over the view's toolbox; a user moves on, so the pointer leaves the tab as a user's would. */
    private async switchTo(view: "domain" | "metrics") {
        await this.page.locator(`[data-testid=view-switcher-${view}]`).click()
        await this.page.mouse.move(0, 0)
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
