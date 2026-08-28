import { TestBed } from "@angular/core/testing"
import { provideRouter, Router } from "@angular/router"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { routeLinks, routePaths } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/store/isDeltaState.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { ModeToggleComponent } from "./modeToggle.component"

describe("ModeToggleComponent", () => {
    let fileSelectionModeService: { toggle: jest.Mock }

    beforeEach(() => {
        fileSelectionModeService = { toggle: jest.fn() }
        TestBed.configureTestingModule({
            imports: [ModeToggleComponent],
            providers: [
                { provide: FileSelectionModeService, useValue: fileSelectionModeService },
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })
    })

    it("should activate Explore tab when not in delta mode", async () => {
        // Arrange & Act
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })

        // Assert
        const exploreButton = screen.getByRole("tab", { name: "Explore" })
        const compareButton = screen.getByRole("tab", { name: "Compare" })
        expect(exploreButton.querySelectorAll(".cc-current-underline").length).toBe(1)
        expect(exploreButton.classList.contains("font-bold")).toBe(true)
        expect(exploreButton.getAttribute("aria-selected")).toBe("true")
        expect(compareButton.querySelectorAll(".cc-current-underline").length).toBe(0)
        expect(compareButton.classList.contains("font-bold")).toBe(false)
        expect(compareButton.getAttribute("aria-selected")).toBe("false")
    })

    it("should activate Compare tab when in delta mode", async () => {
        // Arrange & Act
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: true }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })

        // Assert
        const exploreButton = screen.getByRole("tab", { name: "Explore" })
        const compareButton = screen.getByRole("tab", { name: "Compare" })
        expect(exploreButton.querySelectorAll(".cc-current-underline").length).toBe(0)
        expect(exploreButton.classList.contains("font-bold")).toBe(false)
        expect(exploreButton.getAttribute("aria-selected")).toBe("false")
        expect(compareButton.querySelectorAll(".cc-current-underline").length).toBe(1)
        expect(compareButton.classList.contains("font-bold")).toBe(true)
        expect(compareButton.getAttribute("aria-selected")).toBe("true")
    })

    it("should call toggle when clicking Compare while in standard mode", async () => {
        // Arrange
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })

        // Act
        screen.getByRole("tab", { name: "Compare" }).click()

        // Assert
        expect(fileSelectionModeService.toggle).toHaveBeenCalledTimes(1)
    })

    it("should call toggle when clicking Explore while in delta mode", async () => {
        // Arrange
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: true }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })

        // Act
        screen.getByRole("tab", { name: "Explore" }).click()

        // Assert
        expect(fileSelectionModeService.toggle).toHaveBeenCalledTimes(1)
    })

    it("should not call toggle when clicking the active tab", async () => {
        // Arrange
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })

        // Act
        screen.getByRole("tab", { name: "Explore" }).click()

        // Assert
        expect(fileSelectionModeService.toggle).not.toHaveBeenCalled()
    })

    it("should switch to the metric view when picking a mode from another view", async () => {
        // Arrange
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideRouter([
                    { path: routePaths.metrics, children: [] },
                    { path: routePaths.domain, children: [] }
                ])
            ]
        })
        const router = TestBed.inject(Router)
        const navigateByUrl = jest.spyOn(router, "navigateByUrl")

        // Act — the mode bar is reachable while another view is shown, so the mode implies its view
        screen.getByRole("tab", { name: "Compare" }).click()

        // Assert
        expect(navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics)
        expect(fileSelectionModeService.toggle).toHaveBeenCalledTimes(1)
    })
})
