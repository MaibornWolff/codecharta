import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
import { SearchPanelComponent } from "./searchPanel.component"
import { SearchPanelModule } from "./searchPanel.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { isSearchPanelPinnedSelector } from "../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"

describe("SearchPanelComponent", () => {
    describe("opening and closing of search panel", () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [SearchPanelModule],
                providers: [SearchPanelComponent, provideMockStore()]
            })
        })

        it("should be minimized initially", async () => {
            const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
            expect(isSearchPanelOpen(container)).toBe(false)
            expect(getBodyElementsHidden(container)).toEqual({
                blackListPanel: true,
                matchingFilesCounter: true,
                mapTreeView: true
            })
        })

        it("should open when clicked on search bar", async () => {
            const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
            fireEvent.click(container.querySelector("cc-search-bar"))
            expect(isSearchPanelOpen(container)).toBe(true)
            expect(getBodyElementsHidden(container)).toEqual({
                blackListPanel: true,
                matchingFilesCounter: false,
                mapTreeView: false
            })
        })

        it("should close, when clicking on opened mode", async () => {
            const { container, getByText } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
            fireEvent.click(container.querySelector("cc-search-bar"))
            fireEvent.click(getByText("File/Node Explorer"))
            expect(isSearchPanelOpen(container)).toBe(false)
            expect(getBodyElementsHidden(container)).toEqual({
                blackListPanel: true,
                matchingFilesCounter: true,
                mapTreeView: true
            })
        })
    })

    describe("closing on outside clicks", () => {
        let store: MockStore
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [SearchPanelModule],
                providers: [
                    SearchPanelComponent,
                    provideMockStore({
                        selectors: [{ selector: isSearchPanelPinnedSelector, value: false }]
                    })
                ]
            })
            store = TestBed.inject(MockStore)
        })

        it("should subscribe to mousedown events when opening", () => {
            const addEventListenerSpy = jest.spyOn(document, "addEventListener")
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")

            expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", searchPanelComponent["closeSearchPanelOnOutsideClick"])
        })

        it("should unsubscribe mousedown events when closing", () => {
            const removeEventListenerSpy = jest.spyOn(document, "removeEventListener")
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")
            searchPanelComponent["setSearchPanelMode"]("minimized")

            expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", searchPanelComponent["closeSearchPanelOnOutsideClick"])
        })

        it("should close on outside click when not pinned", () => {
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")

            searchPanelComponent["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)

            expect(searchPanelComponent.searchPanelMode).toBe("minimized")
        })

        it("should not close on outside click when pinned", () => {
            store.overrideSelector(isSearchPanelPinnedSelector, true)
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")

            searchPanelComponent["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)

            expect(searchPanelComponent.searchPanelMode).toBe("treeView")
        })

        it("should not close when clicking inside", () => {
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")

            searchPanelComponent["closeSearchPanelOnOutsideClick"]({
                composedPath: () => [{ nodeName: "CC-SEARCH-PANEL" }]
            } as unknown as MouseEvent)

            expect(searchPanelComponent.searchPanelMode).toBe("treeView")
        })
    })
})

function isSearchPanelOpen(container: Element) {
    return container.querySelector("mat-card").classList.contains("expanded")
}

function getBodyElementsHidden(container: Element) {
    return {
        blackListPanel: container.querySelector("cc-blacklist-panel")["hidden"],
        matchingFilesCounter: container.querySelector("cc-matching-files-counter")["hidden"],
        mapTreeView: container.querySelector("cc-map-tree-view")["hidden"]
    }
}
