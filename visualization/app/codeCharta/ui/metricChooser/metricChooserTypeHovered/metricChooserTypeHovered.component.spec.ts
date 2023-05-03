import { render } from "@testing-library/angular"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"
import { MetricChooserTypeHoveredComponent } from "./metricChooserTypeHovered.component"
import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

describe("metricChooserTypeHovered", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideMockStore({ selectors: [{ selector: isHoveredNodeALeafSelector, value: true }] })]
		})
	})
	it("should be hidden, when hovered node is a leaf", async () => {
		const { container } = await render(MetricChooserTypeHoveredComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})

	it("should not be hidden, when hovered node is a folder", async () => {
		const { container, detectChanges } = await render(MetricChooserTypeHoveredComponent)
		const store = TestBed.inject(MockStore)
		store.overrideSelector(isHoveredNodeALeafSelector, false)
		store.refreshState()
		detectChanges()

		expect(container.querySelector("span").hidden).toBe(false)
	})
})
