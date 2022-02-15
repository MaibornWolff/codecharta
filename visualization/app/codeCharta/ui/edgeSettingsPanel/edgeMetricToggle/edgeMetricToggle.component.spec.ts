import { Store } from "../../../state/store/store"
import { fireEvent, render } from "@testing-library/angular"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"
import { TestBed } from "@angular/core/testing"
import { MaterialModule } from "../../../../material/material.module"
import { toggleEdgeMetricSelector } from "../../../state/store/appSettings/toggleEdgeMetric/toggleEdgeMetric.selector"

describe("edgeMetricToggleComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [MaterialModule]
		})
	})

	it("should toggle edge metric on map on click", async () => {
		const { container } = await render(EdgeMetricToggleComponent)
		const isEdgeMetric = toggleEdgeMetricSelector(Store.store.getState())
		const checkbox = container.querySelector("input")

		expect(checkbox.checked).toBeFalsy()

		fireEvent.click(checkbox)

		expect(checkbox.checked).toBeTruthy()

		expect(toggleEdgeMetricSelector(Store.store.getState())).toBe(!isEdgeMetric)
	})
})
