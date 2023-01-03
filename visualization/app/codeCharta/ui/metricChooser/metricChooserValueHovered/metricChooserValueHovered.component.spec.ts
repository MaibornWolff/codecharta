import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { MetricChooserValueHoveredComponent } from "./metricChooserValueHovered.component"
import { MetricChooserValueHoveredModule } from "./metricChooserValueHovered.module"

jest.mock("../../../state/selectors/primaryMetrics/primaryMetricNames.selector", () => ({
	primaryMetricNamesSelector: () => ({
		areaMetric: "rloc",
		heightMetric: "mcc"
	})
}))
jest.mock("../../../state/selectors/hoveredNode.selector", () => ({
	hoveredNodeSelector: jest.fn()
}))
const mockedHoveredNodeSelector = jest.mocked(hoveredNodeSelector)

describe("metricChooserValueHoveredComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MetricChooserValueHoveredModule]
		})
	})

	it("should display nothing when there is no hovered node", async () => {
		mockedHoveredNodeSelector.mockImplementation(() => undefined)
		const { container } = await render(MetricChooserValueHoveredComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "areaMetric" }
		})
		expect(container.textContent).toBe("")
	})

	it("should display attribute value", async () => {
		mockedHoveredNodeSelector.mockImplementation(() => ({ attributes: { rloc: 42 } } as unknown as CodeMapNode))
		await render(MetricChooserValueHoveredComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "areaMetric" }
		})
		expect(screen.queryByText("42")).not.toBe(null)
		expect(screen.queryByText("Δ")).toBe(null)
	})

	it("should display zero height delta value in grey", async () => {
		mockedHoveredNodeSelector.mockImplementation(
			() =>
				({
					attributes: { mcc: 42 },
					deltas: { mcc: 0 }
				} as unknown as CodeMapNode)
		)
		const { container } = await render(MetricChooserValueHoveredComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})

		expect(screen.queryByText("Δ0")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(230, 230, 230)")
	})

	it("should display positive height delta value in green", async () => {
		mockedHoveredNodeSelector.mockImplementation(
			() =>
				({
					attributes: { mcc: 42 },
					deltas: { mcc: 21 }
				} as unknown as CodeMapNode)
		)
		const { container } = await render(MetricChooserValueHoveredComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})

		expect(screen.queryByText("Δ21")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(177, 216, 168)")
	})

	it("should display negative height delta value in red", async () => {
		mockedHoveredNodeSelector.mockImplementation(
			() =>
				({
					attributes: { mcc: 42 },
					deltas: { mcc: -1 }
				} as unknown as CodeMapNode)
		)
		const { container } = await render(MetricChooserValueHoveredComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { metricFor: "heightMetric" }
		})

		expect(screen.queryByText("Δ-1")).not.toBe(null)
		const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
		expect(deltaContainer.style.backgroundColor).toBe("rgb(255, 204, 204)")
	})
})
