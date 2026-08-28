import { TestBed } from "@angular/core/testing"
import { provideRouter, Router } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { ColorMode } from "../../../../model/codeCharta.model"
import { routeLinks, routePaths, ViewId } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { ViewModeBarComponent } from "./viewModeBar.component"

describe("ViewModeBarComponent", () => {
    const stateWithAbsoluteColorMode = { ...defaultState, mapState: { ...defaultState.mapState, colorMode: ColorMode.absolute } }

    async function setup(view: ViewId, activeViewLink: string = routeLinks.metrics) {
        const rendered = await render(ViewModeBarComponent, {
            inputs: { view },
            providers: [
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ]),
                provideMockStore({
                    initialState: stateWithAbsoluteColorMode,
                    selectors: [{ selector: isDeltaStateSelector, value: false }]
                }),
                { provide: State, useValue: { getValue: () => stateWithAbsoluteColorMode } },
                { provide: FileSelectionModeService, useValue: { toggle: jest.fn() } }
            ]
        })
        await TestBed.inject(Router).navigateByUrl(activeViewLink)
        rendered.detectChanges()
        return rendered
    }

    it("should offer explore, compare and 3D print for the metric view", async () => {
        // Arrange & Act
        await setup("metrics")

        // Assert
        expect(screen.getByRole("tab", { name: "Explore" })).not.toBeNull()
        expect(screen.getByRole("tab", { name: "Compare" })).not.toBeNull()
        expect(screen.getByRole("button", { name: "3D Print" })).not.toBeNull()
    })

    it("should offer explore only for the domain view", async () => {
        // Arrange & Act
        await setup("domain", routeLinks.domain)

        // Assert
        expect(screen.getByTestId("view-mode-domain-explore").textContent.trim()).toBe("Explore")
        expect(screen.queryByRole("button", { name: "3D Print" })).toBeNull()
    })

    it("should link the domain explore mode to the domain route and mark it active there", async () => {
        // Arrange & Act
        await setup("domain", routeLinks.domain)

        // Assert
        const exploreLink = screen.getByTestId("view-mode-domain-explore")
        expect(exploreLink.getAttribute("href")).toBe(routeLinks.domain)
        expect(exploreLink.classList.contains("font-bold")).toBe(true)
        expect(exploreLink.querySelectorAll(".cc-current-underline").length).toBe(1)
    })

    it("should keep 3D print clickable from another view so it can offer the switch", async () => {
        // Arrange & Act — the export needs the rendered code map, but a dead button says nothing about why
        await setup("metrics", routeLinks.domain)

        // Assert
        expect(screen.getByRole("button", { name: "3D Print" }).hasAttribute("disabled")).toBe(false)
    })
})
