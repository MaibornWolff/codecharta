import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
import { SearchPanelComponent } from "./searchPanel.component"
import { SearchPanelModule } from "./searchPanel.module"
import { provideMockStore } from "@ngrx/store/testing"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"

describe(SearchPanelComponent.name, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SearchPanelModule],
            providers: [
                SearchPanelComponent,
                provideMockStore({
                    selectors: [
                        { selector: isSearchPanelPinnedSelector, value: false },
                        { selector: searchPatternSelector, value: "" },
                        { selector: blacklistSelector, value: [] }
                    ]
                })
            ]
        })
    })

    describe("opening and closing of search panel", () => {
        it("should open when clicked on search bar", async () => {
            const fixture = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
            fireEvent.click(fixture.container.querySelector("cc-search-bar"))
            const panel = fixture.container.querySelector("cc-ribbon-bar-panel")
            expect(panel.classList).toContain("expanded")
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

        /*it("should not close on outside click when pinned", () => {
            store.overrideSelector(isSearchPanelPinnedSelector, true)
            const searchPanelComponent = TestBed.inject(SearchPanelComponent)
            searchPanelComponent.ngOnInit()
            searchPanelComponent["setSearchPanelMode"]("treeView")

            searchPanelComponent["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)

            expect(searchPanelComponent.searchPanelMode).toBe("treeView")
        })*/

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
