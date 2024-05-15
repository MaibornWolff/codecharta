import { fireEvent, render } from "@testing-library/angular"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"
import { TestBed } from "@angular/core/testing"
import { MaterialModule } from "../../../../../material/material.module"
import { isEdgeMetricVisibleSelector } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { toggleEdgeMetricVisible } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"

describe("edgeMetricToggleComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            providers: [provideMockStore({ selectors: [{ selector: isEdgeMetricVisibleSelector, value: false }] })]
        })
    })

    it("should toggle edge metric on map on click", async () => {
        const { container } = await render(EdgeMetricToggleComponent)
        const checkbox = container.querySelector("input")
        expect(checkbox.checked).toBe(true)

        fireEvent.click(checkbox)
        const store = TestBed.inject(MockStore)
        expect(await getLastAction(store)).toEqual(toggleEdgeMetricVisible())
    })
})
