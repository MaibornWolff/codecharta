import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"
import { MetricColorRangeDiagramModule } from "./metricColorRangeDiagram.module"

describe("MetricColorRangeDiagramComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [MetricColorRangeDiagramModule]
		})
	})

	it("should render diagram correctly", async () => {
		const { fixture, detectChanges, container } = await render(MetricColorRangeDiagramComponent, {
			componentInputs: {
				minValue: 1,
				maxValue: 100,
				colorMetric: "mcc",
				values: [100, 1, 100, 10, 1, 80, 100, 1],
				currentLeftValue: 10,
				currentRightValue: 67,
				leftColor: "#69AE40",
				middleColor: "#ddcc00",
				rightColor: "#820E0E"
			}
		})

		fixture.componentInstance.ngOnChanges()
		detectChanges()

		const svg = container.querySelector("svg")
		const leftArea = container.querySelector(".left-area") as HTMLElement
		const middleArea = svg.querySelector(".middle-area") as HTMLElement
		const rightArea = svg.querySelector(".right-area") as HTMLElement
		const diagramPath = svg.querySelector("#diagram-path")
		const xLabel = svg.querySelector("#y-label")
		const yLabel = svg.querySelector("#y-label")

		expect(svg).toBeTruthy()
		expect(leftArea).toBeTruthy()
		expect(middleArea).toBeTruthy()
		expect(rightArea).toBeTruthy()
		expect(diagramPath).toBeTruthy()
		expect(xLabel).toBeTruthy()
		expect(yLabel).toBeTruthy()

		expect(leftArea.getAttribute("height")).toBe("80")
		expect(leftArea.getAttribute("width")).toBe("66")
		expect(leftArea.getAttribute("x")).toBe("0")
		expect(leftArea.style.fill).toBe("#69AE40")

		expect(middleArea.getAttribute("height")).toBe("80")
		expect(middleArea.getAttribute("width")).toBe("22")
		expect(middleArea.getAttribute("x")).toBe("66")
		expect(middleArea.style.fill).toBe("#ddcc00")

		expect(rightArea.getAttribute("height")).toBe("80")
		expect(rightArea.getAttribute("width")).toBe("88")
		expect(rightArea.getAttribute("x")).toBe("88")
		expect(rightArea.style.fill).toBe("#820E0E")

		expect(xLabel.textContent).toContain("mcc")
		expect(yLabel.textContent).toContain("mcc")

		expect(diagramPath.getAttribute("d")).toBe("M0,59.4L0,59.4L66,59.4L66,54L88,54L88,12L110,12L110,0L176,0")
	})

	it("should render color-areas correctly when currentLeftValue equals min-value", async () => {
		const { fixture, detectChanges, container } = await render(MetricColorRangeDiagramComponent, {
			componentInputs: {
				minValue: 1,
				maxValue: 100,
				colorMetric: "mcc",
				values: [100, 1, 100, 10, 1, 80, 100, 1],
				currentLeftValue: 1,
				currentRightValue: 67,
				leftColor: "#69AE40",
				middleColor: "#ddcc00",
				rightColor: "#820E0E"
			}
		})

		fixture.componentInstance.ngOnChanges()
		detectChanges()

		const svg = container.querySelector("svg")
		const leftArea = container.querySelector(".left-area") as HTMLElement
		const middleArea = svg.querySelector(".middle-area") as HTMLElement
		const rightArea = svg.querySelector(".right-area") as HTMLElement

		expect(svg).toBeTruthy()
		expect(leftArea).toBeTruthy()
		expect(middleArea).toBeTruthy()
		expect(rightArea).toBeTruthy()

		expect(leftArea.getAttribute("height")).toBe("80")
		expect(leftArea.getAttribute("width")).toBe("0")
		expect(leftArea.getAttribute("x")).toBe("0")
		expect(leftArea.style.fill).toBe("#69AE40")

		expect(middleArea.getAttribute("height")).toBe("80")
		expect(middleArea.getAttribute("width")).toBe("88")
		expect(middleArea.getAttribute("x")).toBe("0")
		expect(middleArea.style.fill).toBe("#ddcc00")

		expect(rightArea.getAttribute("height")).toBe("80")
		expect(rightArea.getAttribute("width")).toBe("88")
		expect(rightArea.getAttribute("x")).toBe("88")
		expect(rightArea.style.fill).toBe("#820E0E")
	})

	it("should render color-areas correctly when currentRightValue equals max-value", async () => {
		const { fixture, detectChanges, container } = await render(MetricColorRangeDiagramComponent, {
			componentInputs: {
				minValue: 1,
				maxValue: 100,
				colorMetric: "mcc",
				values: [100, 1, 100, 10, 1, 80, 100, 1],
				currentLeftValue: 10,
				currentRightValue: 100,
				leftColor: "#69AE40",
				middleColor: "#ddcc00",
				rightColor: "#820E0E"
			}
		})

		fixture.componentInstance.ngOnChanges()
		detectChanges()

		const svg = container.querySelector("svg")
		const leftArea = container.querySelector(".left-area") as HTMLElement
		const middleArea = svg.querySelector(".middle-area") as HTMLElement
		const rightArea = svg.querySelector(".right-area") as HTMLElement

		expect(svg).toBeTruthy()
		expect(leftArea).toBeTruthy()
		expect(middleArea).toBeTruthy()
		expect(rightArea).toBeTruthy()

		expect(leftArea.getAttribute("height")).toBe("80")
		expect(leftArea.getAttribute("width")).toBe("66")
		expect(leftArea.getAttribute("x")).toBe("0")
		expect(leftArea.style.fill).toBe("#69AE40")

		expect(middleArea.getAttribute("height")).toBe("80")
		expect(middleArea.getAttribute("width")).toBe("110")
		expect(middleArea.getAttribute("x")).toBe("66")
		expect(middleArea.style.fill).toBe("#ddcc00")

		expect(rightArea.getAttribute("height")).toBe("80")
		expect(rightArea.getAttribute("width")).toBe("0")
		expect(rightArea.getAttribute("x")).toBe("176")
		expect(rightArea.style.fill).toBe("#820E0E")
	})
})
