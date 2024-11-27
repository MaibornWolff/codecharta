import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"

describe("MetricColorRangeDiagramComponent", () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [MetricColorRangeDiagramComponent]
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

        expect(leftArea.getAttribute("height")).toBe("190")
        expect(leftArea.getAttribute("width")).toBe("180")
        expect(leftArea.getAttribute("x")).toBe("5")
        expect(leftArea.style.fill).toBe("#69AE40")

        expect(middleArea.getAttribute("height")).toBe("190")
        expect(middleArea.getAttribute("width")).toBe("60")
        expect(middleArea.getAttribute("x")).toBe("185")
        expect(middleArea.style.fill).toBe("#ddcc00")

        expect(rightArea.getAttribute("height")).toBe("190")
        expect(rightArea.getAttribute("width")).toBe("240")
        expect(rightArea.getAttribute("x")).toBe("245")
        expect(rightArea.style.fill).toBe("#820E0E")

        expect(xLabel.textContent).toContain("mcc")
        expect(yLabel.textContent).toContain("mcc")

        expect(diagramPath.getAttribute("d")).toBe("M0,178.2L0,178.2L180,178.2L180,162L240,162L240,36L300,36L300,0L480,0")
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

        expect(leftArea.getAttribute("height")).toBe("190")
        expect(Number(leftArea.getAttribute("width"))).toBeCloseTo(320)
        expect(leftArea.getAttribute("x")).toBe("5")
        expect(leftArea.style.fill).toBe("#820E0E")

        expect(middleArea.getAttribute("height")).toBe("190")
        expect(middleArea.getAttribute("width")).toBe("0")
        expect(Number(middleArea.getAttribute("x"))).toBeCloseTo(325)
        expect(middleArea.style.fill).toBe("#ddcc00")

        expect(rightArea.getAttribute("height")).toBe("190")
        expect(Number(rightArea.getAttribute("width"))).toBeCloseTo(160)
        expect(Number(rightArea.getAttribute("x"))).toBeCloseTo(325)
        expect(rightArea.style.fill).toBe("#69AE40")

        expect(xLabel.textContent).toContain("branch_coverage")
        expect(yLabel.textContent).toContain("branch_coverage")

        expect(diagramPath.getAttribute("d")).toBe(
            "M0,180L0,180L53.333,180L53.333,178.105L106.667,178.105L106.667,176.211L160,176.211L160,174.316L213.333,174.316L213.333,172.421L266.667,172.421L266.667,170.526L320,170.526L320,56.842L373.333,56.842L373.333,47.368L426.667,47.368L426.667,28.421L480,28.421"
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

        expect(leftArea.getAttribute("height")).toBe("190")
        expect(leftArea.getAttribute("width")).toBe("0")
        expect(leftArea.getAttribute("x")).toBe("5")
        expect(leftArea.style.fill).toBe("#69AE40")

        expect(middleArea.getAttribute("height")).toBe("190")
        expect(middleArea.getAttribute("width")).toBe("240")
        expect(middleArea.getAttribute("x")).toBe("5")
        expect(middleArea.style.fill).toBe("#ddcc00")

        expect(rightArea.getAttribute("height")).toBe("190")
        expect(rightArea.getAttribute("width")).toBe("240")
        expect(rightArea.getAttribute("x")).toBe("245")
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

        expect(leftArea.getAttribute("height")).toBe("190")
        expect(leftArea.getAttribute("width")).toBe("180")
        expect(leftArea.getAttribute("x")).toBe("5")
        expect(leftArea.style.fill).toBe("#69AE40")

        expect(middleArea.getAttribute("height")).toBe("190")
        expect(middleArea.getAttribute("width")).toBe("300")
        expect(middleArea.getAttribute("x")).toBe("185")
        expect(middleArea.style.fill).toBe("#ddcc00")

        expect(rightArea.getAttribute("height")).toBe("190")
        expect(rightArea.getAttribute("width")).toBe("0")
        expect(rightArea.getAttribute("x")).toBe("485")
        expect(rightArea.style.fill).toBe("#820E0E")
    })

    it("should add cross", async () => {
        const { fixture, detectChanges, container } = await render(MetricColorRangeDiagramComponent, {
            componentInputs: {
                values: [100]
            }
        })

        fixture.componentInstance.ngOnChanges()
        detectChanges()

        const svg = container.querySelector("svg")
        const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement
        const dashedVerticalLine = svg.getElementsByClassName("dashed-vertical-line")[0] as HTMLElement
        const straightVerticalLine = svg.getElementsByClassName("straight-vertical-line")[0] as HTMLElement
        const horizontalLine = svg.getElementsByClassName("horizontal-line")[0] as HTMLElement
        const rectangle = svg.getElementsByClassName("mouse-event-rect")[0] as HTMLElement

        expect(tooltip).toBeTruthy()
        expect(dashedVerticalLine).toBeTruthy()
        expect(straightVerticalLine).toBeTruthy()
        expect(horizontalLine).toBeTruthy()
        expect(rectangle).toBeTruthy()

        expect(tooltip.getAttribute("style")).toBe("display: none;")
        expect(dashedVerticalLine.getAttribute("style")).toBe("display: none;")
        expect(straightVerticalLine.getAttribute("style")).toBe("display: none;")
        expect(horizontalLine.getAttribute("style")).toBe("display: none;")
        expect(rectangle.getAttribute("width")).toBe("490")
        expect(rectangle.getAttribute("height")).toBe("215")
    })

    it("should change visibility of cross on mousemove and mouseout events correctly", async () => {
        const { fixture, container } = await render(MetricColorRangeDiagramComponent, {
            componentInputs: {
                values: [100]
            }
        })

        fixture.componentInstance.ngOnChanges()
        const svg = container.querySelector("svg")
        const rectangle = svg.getElementsByClassName("mouse-event-rect")[0] as HTMLElement
        const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement
        const dashedVerticalLine = svg.getElementsByClassName("dashed-vertical-line")[0] as HTMLElement
        const straightVerticalLine = svg.getElementsByClassName("straight-vertical-line")[0] as HTMLElement
        const horizontalLine = svg.getElementsByClassName("horizontal-line")[0] as HTMLElement

        //WHEN
        rectangle.dispatchEvent(new MouseEvent("mousemove"))

        //THEN
        expect(tooltip.getAttribute("style")).toBe("display: block;")
        expect(dashedVerticalLine.getAttribute("style")).toBe("display: block;")
        expect(straightVerticalLine.getAttribute("style")).toBe("display: block;")
        expect(horizontalLine.getAttribute("style")).toBe("display: block;")

        //WHEN
        rectangle.dispatchEvent(new MouseEvent("mouseout"))

        //THEN
        expect(tooltip.getAttribute("style")).toBe("display: none;")
        expect(dashedVerticalLine.getAttribute("style")).toBe("display: none;")
        expect(straightVerticalLine.getAttribute("style")).toBe("display: none;")
        expect(horizontalLine.getAttribute("style")).toBe("display: none;")
    })

    describe("cross-hair", () => {
        let svg: SVGSVGElement
        let mouseEventRectangle: HTMLElement

        beforeEach(async () => {
            const { container } = await render(MetricColorRangeDiagramComponent, {
                componentInputs: {
                    minValue: 1,
                    maxValue: 10,
                    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                }
            })
            svg = container.querySelector("svg")
            mouseEventRectangle = svg.getElementsByClassName("mouse-event-rect")[0] as HTMLElement
        })

        const expectedYLinePositionsForMouseXPositions = [
            [167, 0],
            [167, 50],
            [95, 200],
            [5, 450],
            [5, 1000]
        ]
        test.each(expectedYLinePositionsForMouseXPositions)("should be on y=%p when mouse on x=%p", (expectedYPosition, mouseXPosition) => {
            //WHEN
            const simulatedEvent = new MouseEvent("mousemove", {
                clientX: mouseXPosition,
                clientY: 0
            })
            mouseEventRectangle.dispatchEvent(simulatedEvent)

            //THEN
            const horizontalLine = svg.getElementsByClassName("horizontal-line")[0] as HTMLElement
            const xPosition = horizontalLine.getAttribute("x2")
            const yPosition = horizontalLine.getAttribute("y1")

            expect(xPosition).toBe(mouseXPosition.toString())
            expect(yPosition).toBe(expectedYPosition.toString())
        })

        const expectedYTooltipPositionsForMouseXPositions = [
            [147, 10, 0],
            [147, 60, 50],
            [115, 210, 200],
            [25, 370, 450],
            [25, 920, 1000]
        ]
        test.each(expectedYTooltipPositionsForMouseXPositions)(
            "should correctly position the tooltip on y=%p and x=%p for mouse on x=%p",
            async (expectedYPosition, expectedXPosition, mouseXPosition) => {
                //WHEN
                const simulatedEvent = new MouseEvent("mousemove", {
                    clientX: mouseXPosition,
                    clientY: 0
                })
                mouseEventRectangle.dispatchEvent(simulatedEvent)

                // Then
                const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement
                const tooltipXPosition = parseInt(tooltip.getAttribute("x"))
                const tooltipYPosition = parseInt(tooltip.getAttribute("y"))

                expect(tooltipXPosition).toBe(expectedXPosition)
                expect(tooltipYPosition).toBe(expectedYPosition)
            }
        )

        const expectedQuantileAndYValueForMouseXPositions = [
            [0, 1, 0],
            [9, 1, 50],
            [41, 5, 200],
            [93, 10, 450],
            [100, 10, 1000]
        ]
        test.each(expectedQuantileAndYValueForMouseXPositions)(
            "should show Quantile: %p and Value: %p as the correct tooltip text when mouse on x=%p",
            (quantile, yValue, mouseXPosition) => {
                //WHEN
                const simulatedEvent = new MouseEvent("mousemove", {
                    clientX: mouseXPosition,
                    clientY: 0
                })
                mouseEventRectangle.dispatchEvent(simulatedEvent)

                //THEN
                const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement

                expect(tooltip.innerHTML).toContain(`Quantile: ${quantile}`)
                expect(tooltip.innerHTML).toContain(`Value: ${yValue}`)
            }
        )
    })
})
