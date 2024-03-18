import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { MetricChooserValueComponent } from "./metricChooserValue.component"
import { MetricChooserValueModule } from "./metricChooserValue.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"

describe("metricChooserValueComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricChooserValueModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: primaryMetricNamesSelector,
							value: {
								areaMetric: "rloc",
								heightMetric: "mcc"
							}
						},
						{ selector: hoveredNodeSelector, value: null }
					]
				})
			]
		})
	})

	it("should display attribute values of top level node when there is no hovered node", async () => {
		const { detectChanges } = await render(MetricChooserValueComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "areaMetric" }
		})
		const store = TestBed.inject(MockStore)
		store.refreshState()
		detectChanges()
		expect(screen.queryByText("42")).not.toBe(null)
	})

	it("should display attribute value", async () => {
		const { detectChanges } = await render(MetricChooserValueComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "areaMetric" }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(hoveredNodeSelector, { attributes: { rloc: 42 } } as unknown as CodeMapNode)
		store.refreshState()
		detectChanges()
		expect(screen.queryByText("42")).not.toBe(null)
		expect(screen.queryByText("Δ")).toBe(null)
	})

	it("should display zero height delta value in grey", async () => {
		const { container, detectChanges } = await render(MetricChooserValueComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(hoveredNodeSelector, {
			attributes: { mcc: 42 },
			deltas: { mcc: 0 }
		} as unknown as CodeMapNode)
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("Δ0")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(230, 230, 230)")
	})

	it("should display positive height delta value in green", async () => {
		const { container, detectChanges } = await render(MetricChooserValueComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(hoveredNodeSelector, {
			attributes: { mcc: 42 },
			deltas: { mcc: 21 }
		} as unknown as CodeMapNode)
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("Δ21")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(177, 216, 168)")
	})

	it("should display negative height delta value in red", async () => {
		const { container, detectChanges } = await render(MetricChooserValueComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(hoveredNodeSelector, {
			attributes: { mcc: 42 },
			deltas: { mcc: -1 }
		} as unknown as CodeMapNode)
		store.refreshState()
		detectChanges()

		expect(screen.queryByText("Δ-1")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(255, 204, 204)")
	})
})
