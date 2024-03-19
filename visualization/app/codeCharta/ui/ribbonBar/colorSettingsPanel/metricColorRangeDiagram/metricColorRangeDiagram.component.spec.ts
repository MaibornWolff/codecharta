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

	it("should render diagram correctly when attribute direction is inversed", async () => {
		const { fixture, detectChanges, container } = await render(MetricColorRangeDiagramComponent, {
			componentInputs: {
				minValue: 15,
				maxValue: 95,
				colorMetric: "branch_coverage",
				values: [15, 25, 30, 90, 91, 92, 93, 94, 95],
				currentLeftValue: 42,
				currentRightValue: 69,
				leftColor: "#69AE40",
				middleColor: "#ddcc00",
				rightColor: "#820E0E",
				isAttributeDirectionInversed: true
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
		expect(Number(leftArea.getAttribute("width"))).toBeCloseTo(117.33)
		expect(leftArea.getAttribute("x")).toBe("0")
		expect(leftArea.style.fill).toBe("#820E0E")

		expect(middleArea.getAttribute("height")).toBe("80")
		expect(middleArea.getAttribute("width")).toBe("0")
		expect(Number(middleArea.getAttribute("x"))).toBeCloseTo(117.33)
		expect(middleArea.style.fill).toBe("#ddcc00")

		expect(rightArea.getAttribute("height")).toBe("80")
		expect(Number(rightArea.getAttribute("width"))).toBeCloseTo(58.666)
		expect(Number(rightArea.getAttribute("x"))).toBeCloseTo(117.33)
		expect(rightArea.style.fill).toBe("#69AE40")

		expect(xLabel.textContent).toContain("branch_coverage")
		expect(yLabel.textContent).toContain("branch_coverage")

		expect(diagramPath.getAttribute("d")).toBe(
			"M0,60L0,60L19.556,60L19.556,59.368L39.111,59.368L39.111,58.737L58.667,58.737L58.667,58.105L78.222,58.105L78.222,57.474L97.778,57.474L97.778,56.842L117.333,56.842L117.333,18.947L136.889,18.947L136.889,15.789L156.444,15.789L156.444,9.474L176,9.474"
		)
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
