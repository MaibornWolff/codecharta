import { render } from "@testing-library/angular"
import { isHoveredNodeALeafSelector } from "./isNodeALeaf.selector"
import { MetricChooserTypeComponent } from "./metricChooserType.component"
import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

describe("metricChooserType", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideMockStore({ selectors: [{ selector: isHoveredNodeALeafSelector, value: true }] })]
		})
	})
	it("should be hidden, when hovered node is a leaf", async () => {
		const { container } = await render(MetricChooserTypeComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})

	it("should not be hidden, when hovered node is a folder", async () => {
		const { container, detectChanges } = await render(MetricChooserTypeComponent)
		const store = TestBed.inject(MockStore)
		store.overrideSelector(isHoveredNodeALeafSelector, false)
		store.refreshState()
		detectChanges()

		expect(container.querySelector("span").hidden).toBe(false)
	})
})
