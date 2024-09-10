import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { SearchPanelComponent } from "./searchPanel.component"
import { SearchPanelModule } from "./searchPanel.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"
import { RibbonBarPanelComponent } from "../ribbonBarPanel/ribbonBarPanel.component"
import { RibbonBarPanelSettingsComponent } from "../ribbonBarPanel/ribbonBarPanelSettings.component"

describe(SearchPanelComponent.name, () => {
    let store: MockStore
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchPanelModule],
            declarations: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent],
            providers: [
                provideMockStore({
                    selectors: [{ selector: isSearchPanelPinnedSelector, value: false }]
                })
            ]
        }).compileComponents()
    })

    afterEach(() => {
        store.resetSelectors()
    })

    it("should open when clicked on search bar", async () => {
        const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
        store = TestBed.inject(MockStore)
        fireEvent.click(container.querySelector("cc-search-bar"))
        const panel = container.querySelector("cc-ribbon-bar-panel")
        expect(panel.classList).toContain("expanded")
    })

    it("when pinned should not close on outside click", async () => {
        const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
        store = TestBed.inject(MockStore)
        store.overrideSelector(isSearchPanelPinnedSelector, true)
        const ribbonBarPanel = container.querySelector("cc-ribbon-bar-panel")

        fireEvent.click(screen.queryByText("File/Node Explorer"))
        expect(ribbonBarPanel.classList).toContain("expanded")

        fireEvent.click(document.body)
        expect(ribbonBarPanel.classList).toContain("expanded")
    })

    it("when not pinned should close when clicking on File/Node Explorer", async () => {
        const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
        store = TestBed.inject(MockStore)
        const ribbonBarPanel = container.querySelector("cc-ribbon-bar-panel")

        fireEvent.click(screen.queryByText("File/Node Explorer"))
        expect(ribbonBarPanel.classList).toContain("expanded")

        fireEvent.click(screen.queryByText("File/Node Explorer"))
        expect(ribbonBarPanel.classList).not.toContain("expanded")
    })
})
