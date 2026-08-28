import { MOCK_PLATFORM_LOCATION_CONFIG } from "@angular/common/testing"
import { TestBed } from "@angular/core/testing"
import { provideRouter, Router } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { locationStrategyProvider } from "../../../../../app.config"
import { hasDomainDataSelector } from "../../../../lenses/domain/domainLens.facade"
import { routeLinks, routePaths } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { ViewSwitcherComponent } from "./viewSwitcher.component"

const deepLinkedUrl = "http://localhost:9009/index.html?file=fileOne.json&area=functions"

const hrefOf = (routeLink: string) => `${deepLinkedUrl}#${routeLink}`

describe("ViewSwitcherComponent", () => {
    async function setup(hasDomainData: boolean, isDeltaState = false) {
        return render(ViewSwitcherComponent, {
            providers: [
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ]),
                locationStrategyProvider,
                { provide: MOCK_PLATFORM_LOCATION_CONFIG, useValue: { startUrl: deepLinkedUrl } },
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: hasDomainDataSelector, value: hasDomainData },
                        { selector: isDeltaStateSelector, value: isDeltaState }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: FileSelectionModeService, useValue: { toggle: jest.fn() } }
            ]
        })
    }

    it("should hide the domain tab when the file has no domain lens", async () => {
        // Arrange & Act
        await setup(false)

        // Assert — the domain view is unreachable, so an unclickable placeholder would only be noise
        expect(screen.getByTestId("view-switcher")).not.toBeNull()
        expect(screen.getByTestId("view-switcher-metrics")).not.toBeNull()
        expect(screen.queryByTestId("view-switcher-domain")).toBeNull()
    })

    it("should keep the domain tab in compare mode", async () => {
        // Arrange & Act
        await setup(true, true)

        // Assert — picking it leaves compare mode rather than being blocked by it
        expect(screen.getByTestId("view-switcher-domain")).not.toBeNull()
    })

    it("should name the switcher for assistive technology", async () => {
        // Arrange & Act
        await setup(true)

        // Assert — two bare links "Metric" and "Domain" are meaningless without a name for the landmark
        expect(screen.getByRole("navigation", { name: "View" })).not.toBeNull()
    })

    it("should mark the active view with aria-current and an underline", async () => {
        // Arrange
        const { detectChanges } = await setup(true)

        // Act
        await TestBed.inject(Router).navigateByUrl(routeLinks.domain)
        detectChanges()

        // Assert — without this a screen reader hears two identical links and no current-page indication
        const domainTab = screen.getByTestId("view-switcher-domain")
        const metricsTab = screen.getByTestId("view-switcher-metrics")
        expect(domainTab.getAttribute("aria-current")).toBe("page")
        expect(metricsTab.getAttribute("aria-current")).toBeNull()
        expect(domainTab.classList.contains("font-bold")).toBe(true)
        expect(metricsTab.classList.contains("font-bold")).toBe(false)
        expect(domainTab.querySelectorAll(".cc-current-underline").length).toBe(1)
        expect(metricsTab.querySelectorAll(".cc-current-underline").length).toBe(0)
    })

    it("should show both tabs when the file has a domain lens", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        expect(screen.getByTestId("view-switcher-metrics")).not.toBeNull()
        expect(screen.getByTestId("view-switcher-domain")).not.toBeNull()
    })

    it("should link the metric tab to the default route and the domain tab to the domain route", async () => {
        // Arrange & Act
        await setup(true)

        // Assert — absolute hrefs that carry the ?file=… deep link into the fragment-routed target
        expect(screen.getByTestId("view-switcher-metrics").getAttribute("href")).toBe(hrefOf(routeLinks.metrics))
        expect(screen.getByTestId("view-switcher-domain").getAttribute("href")).toBe(hrefOf(routeLinks.domain))
    })

    it("should show no mode bar until a tab is hovered", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        expect(screen.queryByTestId("view-mode-bar-overlay")).toBeNull()
    })

    it("should hang a drawer handle below the bar while the mode bar is closed", async () => {
        // Arrange & Act
        await setup(true)

        // Assert — nothing else hints that the tabs pull a drawer open on hover
        expect(screen.getByTestId("view-mode-bar-handle")).not.toBeNull()
    })

    it("should pull the drawer open on the active view when the handle is hovered", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup(true)
        await TestBed.inject(Router).navigateByUrl(routeLinks.domain)
        detectChanges()

        // Act
        fireEvent.mouseEnter(screen.getByTestId("view-mode-bar-handle"))
        detectChanges()

        // Assert — the handle looks pullable, so it opens the same modes as hovering the current tab
        expect(fixture.componentInstance.previewedView()).toBe("domain")
        expect(screen.getByTestId("view-mode-bar-overlay")).not.toBeNull()
    })

    it("should drop the drawer handle once the mode bar takes its place", async () => {
        // Arrange
        const { detectChanges } = await setup(true)

        // Act
        fireEvent.mouseEnter(screen.getByTestId("view-switcher-metrics"))
        detectChanges()

        // Assert — the drawer is out, so a handle below the bar would only duplicate its edge
        expect(screen.queryByTestId("view-mode-bar-handle")).toBeNull()
    })

    it("should show the modes of the hovered tab and drop them again on leaving", async () => {
        // Arrange
        jest.useFakeTimers()
        const { fixture, detectChanges } = await setup(true)

        // Act
        fireEvent.mouseEnter(screen.getByTestId("view-switcher-domain"))
        detectChanges()

        // Assert
        expect(fixture.componentInstance.previewedView()).toBe("domain")
        expect(screen.getByTestId("view-mode-bar-overlay")).not.toBeNull()

        // Act
        fireEvent.mouseLeave(screen.getByTestId("view-switcher").parentElement)
        jest.runAllTimers()
        detectChanges()

        // Assert
        expect(screen.queryByTestId("view-mode-bar-overlay")).toBeNull()
        jest.useRealTimers()
    })

    it("should keep the mode bar open while the pointer travels down into it", async () => {
        // Arrange — the pointer crosses the seam between the nav bar and the floating bar below it
        jest.useFakeTimers()
        const { fixture, detectChanges } = await setup(true)
        fireEvent.mouseEnter(screen.getByTestId("view-switcher-metrics"))
        detectChanges()

        // Act
        fireEvent.mouseLeave(screen.getByTestId("view-switcher").parentElement)
        fireEvent.mouseEnter(screen.getByTestId("view-mode-bar-overlay"))
        jest.runAllTimers()
        detectChanges()

        // Assert
        expect(fixture.componentInstance.previewedView()).toBe("metrics")
        jest.useRealTimers()
    })

    it("should show the modes of the focused tab so the bar is reachable by keyboard", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup(true)

        // Act
        fireEvent.focusIn(screen.getByTestId("view-switcher-metrics"))
        detectChanges()

        // Assert
        expect(fixture.componentInstance.previewedView()).toBe("metrics")
    })

    it("should keep the mode bar open while the focus moves into it", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup(true)
        fireEvent.focusIn(screen.getByTestId("view-switcher-metrics"))
        detectChanges()

        // Act
        fireEvent.focusOut(screen.getByTestId("view-switcher-metrics"), { relatedTarget: screen.getByTestId("view-mode-bar-overlay") })
        detectChanges()

        // Assert
        expect(fixture.componentInstance.previewedView()).toBe("metrics")
    })

    it("should close the mode bar when the focus leaves the switcher entirely", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup(true)
        fireEvent.focusIn(screen.getByTestId("view-switcher-metrics"))
        detectChanges()

        // Act
        fireEvent.focusOut(screen.getByTestId("view-switcher-metrics"), { relatedTarget: document.body })
        detectChanges()

        // Assert
        expect(fixture.componentInstance.previewedView()).toBeNull()
    })

    it("should close the mode bar as soon as a tab is picked", async () => {
        // Arrange — the pointer rests on the tab after the click, so nothing but the pick closes the bar
        const { fixture, detectChanges } = await setup(true)
        fireEvent.mouseEnter(screen.getByTestId("view-switcher-domain"))
        detectChanges()

        // Act
        screen.getByTestId("view-switcher-domain").click()
        detectChanges()

        // Assert — a bar left open would keep covering the view right below the nav bar
        expect(fixture.componentInstance.previewedView()).toBeNull()
    })
})
