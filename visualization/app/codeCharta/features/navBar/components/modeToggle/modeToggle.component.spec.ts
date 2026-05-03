import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { defaultState } from "../../../../state/store/state.manager"
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
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
    })

    it("should activate Explore tab when not in delta mode", async () => {
        // Arrange & Act
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })

        // Assert
        const exploreButton = screen.getByRole("tab", { name: "Explore" })
        const compareButton = screen.getByRole("tab", { name: "Compare" })
        expect(exploreButton.classList.contains("text-primary")).toBe(true)
        expect(exploreButton.classList.contains("font-bold")).toBe(true)
        expect(compareButton.classList.contains("text-primary")).toBe(false)
        expect(compareButton.classList.contains("font-bold")).toBe(false)
    })

    it("should activate Compare tab when in delta mode", async () => {
        // Arrange & Act
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: true }] }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })

        // Assert
        const exploreButton = screen.getByRole("tab", { name: "Explore" })
        const compareButton = screen.getByRole("tab", { name: "Compare" })
        expect(exploreButton.classList.contains("text-primary")).toBe(false)
        expect(exploreButton.classList.contains("font-bold")).toBe(false)
        expect(compareButton.classList.contains("text-primary")).toBe(true)
        expect(compareButton.classList.contains("font-bold")).toBe(true)
    })

    it("should call toggle when clicking Compare while in standard mode", async () => {
        // Arrange
        await render(ModeToggleComponent, {
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: isDeltaStateSelector, value: false }] }),
                { provide: State, useValue: { getValue: () => defaultState } }
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
                { provide: State, useValue: { getValue: () => defaultState } }
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
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })

        // Act
        screen.getByRole("tab", { name: "Explore" }).click()

        // Assert
        expect(fileSelectionModeService.toggle).not.toHaveBeenCalled()
    })
})
