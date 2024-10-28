import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { LegendMarkedPackagesComponent } from "./legendMarkedPackages.component"
import { legendMarkedPackagesSelector } from "./legendMarkedPackages.selector"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

describe("LegendMarkedPackagesComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LegendMarkedPackagesComponent],
            providers: [provideMockStore({ selectors: [{ selector: legendMarkedPackagesSelector, value: {} }] })]
        })
    })

    it("shouldn't display anything if there are no marked packages", async () => {
        const { container } = await render(LegendMarkedPackagesComponent)

        expect(container.textContent).toBe("")
    })

    it("should display color pickers for each marked package, sorted by first marked path", async () => {
        const { container, detectChanges } = await render(LegendMarkedPackagesComponent)
        const store = TestBed.inject(MockStore)
        store.overrideSelector(legendMarkedPackagesSelector, {
            "#ffffff": ["/blackMarked/whiteMarked"],
            "#000000": ["/blackMarked"]
        })
        store.refreshState()
        detectChanges()

        expect(container.querySelectorAll("cc-labelled-color-picker").length).toBe(2)
        expect(container.querySelectorAll("cc-labelled-color-picker")[0].textContent).toMatch("/blackMarked")
        expect(container.querySelectorAll("cc-labelled-color-picker")[1].textContent).toMatch("/blackMarked/whiteMarked")
    })
})
