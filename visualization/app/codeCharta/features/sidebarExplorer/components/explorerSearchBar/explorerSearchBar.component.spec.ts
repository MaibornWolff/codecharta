import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ExplorerMode, FILES_EXPLORER_MODE } from "../../explorerModes"
import { createExplorerSearchInputMock, createExplorerSearchMock, provideExplorerPortsMock } from "../../explorerPorts.mocks"
import { ExplorerSearch, ExplorerSearchInput } from "../../explorerSearch.port"
import { ExplorerModeService } from "../../services/explorerMode.service"
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

    describe("with a second mode that searches words", () => {
        const WORDS_MODE: ExplorerMode = {
            id: "words",
            label: "Words",
            icon: "fa-solid fa-font",
            searchPlaceholder: "payment, invoice",
            searchAriaLabel: "Search words"
        }

        let wordSearch: ExplorerSearchInput
        let wordPattern$: BehaviorSubject<string>

        const configureWithWordSearch = () => {
            TestBed.resetTestingModule()
            wordPattern$ = new BehaviorSubject("")
            const isWordPatternEmpty$ = new BehaviorSubject(true)
            wordPattern$.subscribe(value => isWordPatternEmpty$.next(value === ""))
            search = createExplorerSearchMock({ pattern$: new BehaviorSubject("*.ts"), isPatternEmpty$: new BehaviorSubject(false) })
            wordSearch = createExplorerSearchInputMock({
                pattern$: wordPattern$,
                isPatternEmpty$: isWordPatternEmpty$,
                setPattern: jest.fn(value => wordPattern$.next(value)),
                resetPattern: jest.fn(() => wordPattern$.next(""))
            })
            TestBed.configureTestingModule({
                imports: [ExplorerSearchBarComponent],
                providers: [
                    provideMockStore({ initialState: defaultState }),
                    ...provideExplorerPortsMock({
                        search,
                        wordSearch,
                        capabilities: { modes: [FILES_EXPLORER_MODE, WORDS_MODE] }
                    })
                ]
            })
        }

        const activateWordMode = (detectChanges: () => void) => {
            TestBed.inject(ExplorerModeService).activate(WORDS_MODE.id)
            detectChanges()
        }

        beforeEach(() => {
            configureWithWordSearch()
        })

        it("should label the box after the active mode", async () => {
            // Arrange
            const { detectChanges } = await render(ExplorerSearchBarComponent)

            // Act
            activateWordMode(detectChanges)

            // Assert
            expect(screen.getByPlaceholderText(WORDS_MODE.searchPlaceholder).getAttribute("aria-label")).toBe(WORDS_MODE.searchAriaLabel)
        })

        it("should hand a typed pattern to the word search while the explorer browses words", async () => {
            // Arrange
            const { detectChanges } = await render(ExplorerSearchBarComponent)
            activateWordMode(detectChanges)

            // Act
            await userEvent.type(screen.getByPlaceholderText(WORDS_MODE.searchPlaceholder), "invoice")

            // Assert
            await waitFor(() => expect(wordSearch.setPattern).toHaveBeenCalledWith("invoice"))
            expect(search.setPattern).not.toHaveBeenCalled()
        })

        it("should show each mode its own pattern, so switching back does not lose the other one", async () => {
            // Arrange
            const { detectChanges } = await render(ExplorerSearchBarComponent)
            activateWordMode(detectChanges)
            wordPattern$.next("invoice")
            detectChanges()
            expect((screen.getByPlaceholderText(WORDS_MODE.searchPlaceholder) as HTMLInputElement).value).toBe("invoice")

            // Act
            TestBed.inject(ExplorerModeService).activate(FILES_EXPLORER_MODE.id)
            detectChanges()

            // Assert
            expect((screen.getByPlaceholderText(FILES_EXPLORER_MODE.searchPlaceholder) as HTMLInputElement).value).toBe("*.ts")
        })

        it("should reset the word pattern when clearing while the explorer browses words", async () => {
            // Arrange
            const { detectChanges } = await render(ExplorerSearchBarComponent)
            activateWordMode(detectChanges)
            wordPattern$.next("invoice")
            detectChanges()

            // Act
            await userEvent.click(screen.getByTestId("search-bar-clear-button"))

            // Assert
            expect(wordSearch.resetPattern).toHaveBeenCalled()
            expect(search.resetPattern).not.toHaveBeenCalled()
        })
    })
})
