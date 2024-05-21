import { render } from "@testing-library/angular"
import { SearchPanelModeSelectorComponent } from "./searchPanelModeSelector.component"
import { provideMockStore } from "@ngrx/store/testing"
import { hideBlacklistItemsIndicatorSelector } from "./hideBlacklistItemsIndicator.selector"
import { TestBed } from "@angular/core/testing"
import { MatButtonToggleModule } from "@angular/material/button-toggle"

describe("SearchPanelModeSelectorComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatButtonToggleModule]
        })
    })
    it("should not show blacklist items indicator when there are no blacklist items", async () => {
        const { container } = await render(SearchPanelModeSelectorComponent, {
            providers: [provideMockStore({ selectors: [{ selector: hideBlacklistItemsIndicatorSelector, value: true }] })]
        })

        expect(container.querySelector(".has-blacklist-items-indicator")["hidden"]).toBe(true)
    })

    it("should show blacklist items indicator when there are blacklist items", async () => {
        const { container } = await render(SearchPanelModeSelectorComponent, {
            providers: [provideMockStore({ selectors: [{ selector: hideBlacklistItemsIndicatorSelector, value: false }] })]
        })

        expect(container.querySelector(".has-blacklist-items-indicator")["hidden"]).toBe(false)
    })
})
