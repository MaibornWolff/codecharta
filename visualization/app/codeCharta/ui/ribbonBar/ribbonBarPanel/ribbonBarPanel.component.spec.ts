import { provideMockStore } from "@ngrx/store/testing"
import { RibbonBarComponent } from "../ribbonBar.component"
import { RibbonBarPanelModule } from "./ribbonBarPanel.module"
import { render } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"

describe(RibbonBarComponent.name, () => {
    describe("with expandable settings", () => {
        let panel: Element

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [RibbonBarPanelModule],
                providers: [RibbonBarComponent, RibbonBarPanelSettingsComponent, provideMockStore()]
            })
            const { container } = await render(
                `<cc-ribbon-bar-panel>
                  <cc-ribbon-bar-panel-settings></cc-ribbon-bar-panel-settings>
                </cc-ribbon-bar-panel>`,
                {
                    excludeComponentDeclaration: true
                }
            )
            panel = container.querySelector('cc-ribbon-bar-panel')
        })

        it("should be expandable", () => {
            expect(panel.classList).toContain("expandable")
        })

        describe("opening and closing of search panel", () => {
            it("should be minimized initially", async () => {
                expect(panel.classList).not.toContain("expanded")
            })

            // it("should open when clicked on search bar", async () => {
            //     const { container } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            //     fireEvent.click(container.querySelector("cc-search-bar"))
            //     expect(isSearchPanelOpen(container)).toBe(true)
            //     expect(getBodyElementsHidden(container)).toEqual({
            //         blackListPanel: true,
            //         matchingFilesCounter: false,
            //         mapTreeView: false
            //     })
            // })

            // it("should close, when clicking on opened mode", async () => {
            //     const { container, getByText } = await render(RibbonBarComponent, { excludeComponentDeclaration: true })
            //     fireEvent.click(container.querySelector("cc-search-bar"))
            //     fireEvent.click(getByText("File/Node Explorer"))
            //     expect(isSearchPanelOpen(container)).toBe(false)
            //     expect(getBodyElementsHidden(container)).toEqual({
            //         blackListPanel: true,
            //         matchingFilesCounter: true,
            //         mapTreeView: true
            //     })
            // })
        })

        // describe("closing on outside clicks", () => {
        //     let store: MockStore
        //     beforeEach(() => {
        //         TestBed.configureTestingModule({
        //             imports: [RibbonBarPanelModule],
        //             providers: [
        //                 RibbonBarComponent,
        //                 provideMockStore({
        //                     selectors: [{ selector: isSearchPanelPinnedSelector, value: false }]
        //                 })
        //             ]
        //         })
        //         store = TestBed.inject(MockStore)
        //     })

        //     it("should subscribe to mousedown events when opening", () => {
        //         const addEventListenerSpy = jest.spyOn(document, "addEventListener")
        //         const searchPanelComponent = TestBed.inject(RibbonBarPanelComponent)
        //         searchPanelComponent.ngOnInit()
        //         searchPanelComponent["setSearchPanelMode"]("treeView")

        //         expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", searchPanelComponent["closeSearchPanelOnOutsideClick"])
        //     })

        //     it("should unsubscribe mousedown events when closing", () => {
        //         const removeEventListenerSpy = jest.spyOn(document, "removeEventListener")
        //         const searchPanelComponent = TestBed.inject(RibbonBarPanelComponent)
        //         searchPanelComponent.ngOnInit()
        //         searchPanelComponent["setSearchPanelMode"]("treeView")
        //         searchPanelComponent["setSearchPanelMode"]("minimized")

        //         expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", searchPanelComponent["closeSearchPanelOnOutsideClick"])
        //     })

        //     it("should close on outside click when not pinned", () => {
        //         const searchPanelComponent = TestBed.inject(RibbonBarPanelComponent)
        //         searchPanelComponent.ngOnInit()
        //         searchPanelComponent["setSearchPanelMode"]("treeView")

        //         searchPanelComponent["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)

        //         expect(searchPanelComponent.searchPanelMode).toBe("minimized")
        //     })

        //     it("should not close on outside click when pinned", () => {
        //         store.overrideSelector(isSearchPanelPinnedSelector, true)
        //         const searchPanelComponent = TestBed.inject(RibbonBarPanelComponent)
        //         searchPanelComponent.ngOnInit()
        //         searchPanelComponent["setSearchPanelMode"]("treeView")

        //         searchPanelComponent["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)

        //         expect(searchPanelComponent.searchPanelMode).toBe("treeView")
        //     })

        //     it("should not close when clicking inside", () => {
        //         const searchPanelComponent = TestBed.inject(RibbonBarPanelComponent)
        //         searchPanelComponent.ngOnInit()
        //         searchPanelComponent["setSearchPanelMode"]("treeView")

        //         searchPanelComponent["closeSearchPanelOnOutsideClick"]({
        //             composedPath: () => [{ nodeName: "CC-SEARCH-PANEL" }]
        //         } as unknown as MouseEvent)

        //         expect(searchPanelComponent.searchPanelMode).toBe("treeView")
        //     })
        // })
    })
})
