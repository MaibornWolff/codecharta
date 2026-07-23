import { MOCK_PLATFORM_LOCATION_CONFIG } from "@angular/common/testing"
import { TestBed } from "@angular/core/testing"
import { provideRouter, Router } from "@angular/router"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { locationStrategyProvider } from "../../../../../app.config"
import { hasDomainDataSelector } from "../../../../lenses/domain/domainLens.facade"
import { routeLinks, routePaths } from "../../../../routing/routePaths"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ViewSwitcherComponent } from "./viewSwitcher.component"

const deepLinkedUrl = "http://localhost:9009/index.html?file=fileOne.json&area=functions"

const hrefOf = (routeLink: string) => `${deepLinkedUrl}#${routeLink}`

describe("ViewSwitcherComponent", () => {
    async function setup(hasDomainData: boolean) {
        return render(ViewSwitcherComponent, {
            providers: [
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ]),
                locationStrategyProvider,
                { provide: MOCK_PLATFORM_LOCATION_CONFIG, useValue: { startUrl: deepLinkedUrl } },
                provideMockStore({ initialState: defaultState, selectors: [{ selector: hasDomainDataSelector, value: hasDomainData }] })
            ]
        })
    }

    it("should offer the domain option as a disabled button when the file has no domain lens", async () => {
        // Arrange & Act
        await setup(false)

        // Assert — kept visible for discoverability, but unclickable, so it can never navigate anywhere
        expect(screen.getByTestId("view-switcher")).not.toBeNull()
        expect(screen.getByTestId("view-switcher-metrics")).not.toBeNull()
        expect(screen.queryByTestId("view-switcher-domain")).toBeNull()
        const unavailableDomainOption = screen.getByTestId("view-switcher-domain-unavailable")
        expect(unavailableDomainOption.hasAttribute("disabled")).toBe(true)
        expect(unavailableDomainOption.hasAttribute("href")).toBe(false)
    })

    it("should name the switcher for assistive technology", async () => {
        // Arrange & Act
        await setup(true)

        // Assert — two bare links "Metrics" and "Domain" are meaningless without a name for the landmark
        expect(screen.getByRole("navigation", { name: "View" })).not.toBeNull()
    })

    it("should mark the active view with aria-current for assistive technology", async () => {
        // Arrange
        const { detectChanges } = await setup(true)

        // Act
        await TestBed.inject(Router).navigateByUrl(routeLinks.domain)
        detectChanges()

        // Assert — without this a screen reader hears two identical links and no current-page indication
        expect(screen.getByTestId("view-switcher-domain").getAttribute("aria-current")).toBe("page")
        expect(screen.getByTestId("view-switcher-metrics").getAttribute("aria-current")).toBeNull()
        expect(screen.getByTestId("view-switcher-domain").classList.contains("text-secondary")).toBe(true)
        expect(screen.getByTestId("view-switcher-metrics").classList.contains("text-secondary")).toBe(false)
    })

    it("should show both options when the file has a domain lens", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        expect(screen.getByTestId("view-switcher-metrics")).not.toBeNull()
        expect(screen.getByTestId("view-switcher-domain")).not.toBeNull()
    })

    it("should link the map option to the default route and the domain option to the domain route", async () => {
        // Arrange & Act
        await setup(true)

        // Assert — absolute hrefs that carry the ?file=… deep link into the fragment-routed target
        expect(screen.getByTestId("view-switcher-metrics").getAttribute("href")).toBe(hrefOf(routeLinks.metrics))
        expect(screen.getByTestId("view-switcher-domain").getAttribute("href")).toBe(hrefOf(routeLinks.domain))
    })
})
