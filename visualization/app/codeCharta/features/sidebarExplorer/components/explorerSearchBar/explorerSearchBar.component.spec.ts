import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MatDialog } from "@angular/material/dialog"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { resultsInEmptyMap } from "../../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap"
import { BlacklistSearchPatternEffect } from "../../../../state/effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { ExplorerSearchBarComponent } from "./explorerSearchBar.component"

jest.mock("../../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap", () => ({
    resultsInEmptyMap: jest.fn()
}))
const mockedResultsInEmptyMap = jest.mocked(resultsInEmptyMap)

describe("ExplorerSearchBarComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ExplorerSearchBarComponent,
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect])
            ],
            providers: [{ provide: MatDialog, useValue: { open: jest.fn() } }]
        })
    })

    it("should render input and reveal clear button when not empty", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        expect(screen.queryByTestId("search-bar-clear-button")).toBe(null)

        // Act
        const searchField = screen.getByPlaceholderText("*.js, **/app/*") as HTMLInputElement
        await userEvent.type(searchField, "needle", { delay: 1 })

        // Assert
        await screen.findByTestId("search-bar-clear-button")
    })

    it("should clear search pattern when clicking clear button", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        const searchField = screen.getByPlaceholderText("*.js, **/app/*") as HTMLInputElement
        await userEvent.type(searchField, "needle")
        const clearButton = await screen.findByTestId("search-bar-clear-button")

        // Act
        await userEvent.click(clearButton)

        // Assert
        await waitFor(() => expect(searchField.value).toBe(""))
    })

    it("should add to flatten blacklist via 3-dot menu", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        const searchField = screen.getByPlaceholderText("*.js, **/app/*") as HTMLInputElement
        await userEvent.type(searchField, "needle")
        await screen.findByTestId("search-bar-clear-button")

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

        // Assert
        await waitFor(() => expect(searchField.value).toBe(""))
    })

    it("should add to exclude blacklist via 3-dot menu", async () => {
        // Arrange
        mockedResultsInEmptyMap.mockImplementation(() => false)
        await render(ExplorerSearchBarComponent)
        const searchField = screen.getByPlaceholderText("*.js, **/app/*") as HTMLInputElement
        await userEvent.type(searchField, "needle")
        await screen.findByTestId("search-bar-clear-button")

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

        // Assert
        await waitFor(() => expect(searchField.value).toBe(""))
    })

    it("should dispatch when input changes", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        const searchField = screen.getByPlaceholderText("*.js, **/app/*") as HTMLInputElement

        // Act
        await userEvent.type(searchField, "x")

        // Assert
        await waitFor(() => expect(dispatchSpy).toHaveBeenCalled())
    })
})
