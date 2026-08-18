import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { createExplorerSearchMock, provideExplorerPortsMock } from "../../explorerPorts.mocks"
import { ExplorerSearch } from "../../explorerSearch.port"
import { ExplorerSearchBarComponent } from "./explorerSearchBar.component"

describe("ExplorerSearchBarComponent", () => {
    let pattern$: BehaviorSubject<string>
    let search: ExplorerSearch

    const configure = (capabilities?: { showRules?: boolean }) => {
        pattern$ = new BehaviorSubject("")
        const isPatternEmpty$ = new BehaviorSubject(true)
        pattern$.subscribe(value => isPatternEmpty$.next(value === ""))
        search = createExplorerSearchMock({
            pattern$,
            isPatternEmpty$,
            setPattern: jest.fn(value => pattern$.next(value)),
            resetPattern: jest.fn(() => pattern$.next(""))
        })
        TestBed.configureTestingModule({
            imports: [ExplorerSearchBarComponent],
            providers: [provideMockStore({ initialState: defaultState }), ...provideExplorerPortsMock({ search, capabilities })]
        })
    }

    beforeEach(() => {
        localStorage.clear()
        configure()
    })

    it("should hand a typed pattern to the search port of the current view", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        const searchField = screen.getByPlaceholderText("*.js, **/app/*")

        // Act
        await userEvent.type(searchField, "needle")

        // Assert
        await waitFor(() => expect(search.setPattern).toHaveBeenCalledWith("needle"))
    })

    it("should reveal the clear button only once a pattern is set", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        expect(screen.queryByTestId("search-bar-clear-button")).toBe(null)

        // Act
        await userEvent.type(screen.getByPlaceholderText("*.js, **/app/*"), "needle")

        // Assert
        await screen.findByTestId("search-bar-clear-button")
    })

    it("should reset the pattern through the search port when clearing", async () => {
        // Arrange
        await render(ExplorerSearchBarComponent)
        await userEvent.type(screen.getByPlaceholderText("*.js, **/app/*"), "needle")

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-clear-button"))

        // Assert
        expect(search.resetPattern).toHaveBeenCalled()
    })

    it("should not let a pending keystroke restore the pattern after clearing", async () => {
        // Arrange — clear is clicked while a freshly typed pattern is still waiting out the debounce
        await render(ExplorerSearchBarComponent)
        const searchField = screen.getByPlaceholderText("*.js, **/app/*")
        await userEvent.type(searchField, "abc")
        await screen.findByTestId("search-bar-clear-button")
        jest.mocked(search.setPattern).mockClear()
        await userEvent.type(searchField, "d")

        // Act
        await userEvent.click(screen.getByTestId("search-bar-clear-button"))

        // Assert
        await waitFor(() => expect(search.resetPattern).toHaveBeenCalled())
        expect(search.setPattern).not.toHaveBeenCalled()
    })

    it("should offer the blacklist actions for a view that owns flatten and exclude rules", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerSearchBarComponent)

        // Assert
        expect(container.querySelector("cc-explorer-search-actions")).not.toBe(null)
    })

    it("should hide the blacklist actions for a view without flatten and exclude rules", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configure({ showRules: false })

        // Act
        const { container } = await render(ExplorerSearchBarComponent)

        // Assert
        expect(container.querySelector("cc-explorer-search-actions")).toBe(null)
    })
})
