import { ComponentFixture, TestBed } from "@angular/core/testing"
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

    it("should render diagram correctly when attribute direction is inverted", async () => {
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
                isAttributeDirectionInverted: true
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

    it("should change visibility of cross at mousemove and mouseout events correctly", async () => {
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
        let container: Element
        let fixture: ComponentFixture<MetricColorRangeDiagramComponent>
        let svg: Element
        let mouseEventRectangle: HTMLElement

        beforeEach(async () => {
            const metricColorRangeDiagramComponent = await render(MetricColorRangeDiagramComponent, {
                componentInputs: {
                    minValue: 1,
                    maxValue: 10,
                    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                }
            })
            container = metricColorRangeDiagramComponent.container
            fixture = metricColorRangeDiagramComponent.fixture
        })

        function simulateMouseEvent(isAttributeDirectionInverted: boolean, mouseXPosition: number) {
            fixture.componentInstance.isAttributeDirectionInverted = isAttributeDirectionInverted
            fixture.componentInstance.ngOnChanges()

            svg = container.querySelector("svg")
            mouseEventRectangle = svg.getElementsByClassName("mouse-event-rect")[0] as HTMLElement

            const simulatedEvent = new MouseEvent("mousemove", {
                clientX: mouseXPosition,
                clientY: 0
            })
            mouseEventRectangle.dispatchEvent(simulatedEvent)
        }

        const expectedYLinePositionsForMouseXPositions = [
            { isAttributeDirectionInverted: false, mouseXPosition: 0, expectedYPosition: 167 },
            { isAttributeDirectionInverted: false, mouseXPosition: 50, expectedYPosition: 167 },
            { isAttributeDirectionInverted: false, mouseXPosition: 200, expectedYPosition: 95 },
            { isAttributeDirectionInverted: false, mouseXPosition: 450, expectedYPosition: 5 },
            { isAttributeDirectionInverted: false, mouseXPosition: 1000, expectedYPosition: 5 },
            { isAttributeDirectionInverted: true, mouseXPosition: 0, expectedYPosition: 185 },
            { isAttributeDirectionInverted: true, mouseXPosition: 50, expectedYPosition: 185 },
            { isAttributeDirectionInverted: true, mouseXPosition: 200, expectedYPosition: 113 },
            { isAttributeDirectionInverted: true, mouseXPosition: 450, expectedYPosition: 23 },
            { isAttributeDirectionInverted: true, mouseXPosition: 1000, expectedYPosition: 23 }
        ]
        test.each(expectedYLinePositionsForMouseXPositions)(
            `should be at expectedYPosition=$expectedYPosition for isAttributeDirectionInverted=$isAttributeDirectionInverted attribute direction and mouseXPosition=$mouseXPosition`,
            ({ isAttributeDirectionInverted, mouseXPosition, expectedYPosition }) => {
                //WHEN
                simulateMouseEvent(isAttributeDirectionInverted, mouseXPosition)

                //THEN
                const horizontalLine = svg.getElementsByClassName("horizontal-line")[0] as HTMLElement
                const xPosition = horizontalLine.getAttribute("x2")
                const yPosition = horizontalLine.getAttribute("y1")

                expect(xPosition).toBe(mouseXPosition.toString())
                expect(yPosition).toBe(expectedYPosition.toString())
            }
        )

        const expectedYTooltipPositionsForMouseXPositions = [
            { isAttributeDirectionInverted: false, mouseXPosition: 0, expectedXPosition: 10, expectedYPosition: 147 },
            { isAttributeDirectionInverted: false, mouseXPosition: 50, expectedXPosition: 60, expectedYPosition: 147 },
            { isAttributeDirectionInverted: false, mouseXPosition: 200, expectedXPosition: 210, expectedYPosition: 75 },
            { isAttributeDirectionInverted: false, mouseXPosition: 450, expectedXPosition: 370, expectedYPosition: 25 },
            { isAttributeDirectionInverted: false, mouseXPosition: 1000, expectedXPosition: 920, expectedYPosition: 25 },
            { isAttributeDirectionInverted: true, mouseXPosition: 0, expectedXPosition: 10, expectedYPosition: 165 },
            { isAttributeDirectionInverted: true, mouseXPosition: 50, expectedXPosition: 60, expectedYPosition: 165 },
            { isAttributeDirectionInverted: true, mouseXPosition: 200, expectedXPosition: 210, expectedYPosition: 93 },
            { isAttributeDirectionInverted: true, mouseXPosition: 450, expectedXPosition: 370, expectedYPosition: 43 },
            { isAttributeDirectionInverted: true, mouseXPosition: 1000, expectedXPosition: 920, expectedYPosition: 43 }
        ]
        test.each(expectedYTooltipPositionsForMouseXPositions)(
            `should show tooltip at expectedXPosition=$expectedXPosition and expectedYPosition=$expectedYPosition for isAttributeDirectionInverted=$isAttributeDirectionInverted attribute direction and mouseXPosition=$mouseXPosition`,
            async ({ isAttributeDirectionInverted, mouseXPosition, expectedXPosition, expectedYPosition }) => {
                //WHEN
                simulateMouseEvent(isAttributeDirectionInverted, mouseXPosition)

                // Then
                const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement
                const tooltipXPosition = Number.parseInt(tooltip.getAttribute("x"))
                const tooltipYPosition = Number.parseInt(tooltip.getAttribute("y"))

                expect(tooltipXPosition).toBe(expectedXPosition)
                expect(tooltipYPosition).toBe(expectedYPosition)
            }
        )

        const expectedQuantileAndYValueForMouseXPositions = [
            { isAttributeDirectionInverted: false, mouseXPosition: 0, expectedQuantile: 0, expectedYValue: 1 },
            { isAttributeDirectionInverted: false, mouseXPosition: 50, expectedQuantile: 9, expectedYValue: 1 },
            { isAttributeDirectionInverted: false, mouseXPosition: 200, expectedQuantile: 41, expectedYValue: 5 },
            { isAttributeDirectionInverted: false, mouseXPosition: 450, expectedQuantile: 93, expectedYValue: 10 },
            { isAttributeDirectionInverted: false, mouseXPosition: 1000, expectedQuantile: 100, expectedYValue: 10 },
            { isAttributeDirectionInverted: true, mouseXPosition: 0, expectedQuantile: 0, expectedYValue: 10 },
            { isAttributeDirectionInverted: true, mouseXPosition: 50, expectedQuantile: 9, expectedYValue: 10 },
            { isAttributeDirectionInverted: true, mouseXPosition: 200, expectedQuantile: 41, expectedYValue: 6 },
            { isAttributeDirectionInverted: true, mouseXPosition: 450, expectedQuantile: 93, expectedYValue: 1 },
            { isAttributeDirectionInverted: true, mouseXPosition: 1000, expectedQuantile: 100, expectedYValue: 1 }
        ]
        test.each(expectedQuantileAndYValueForMouseXPositions)(
            `should show quantile=$expectedQuantile and yValue=$expectedYValue for isAttributeDirectionInverted=$attributeDirectionInverted attribute direction and mouseXPosition=$mouseXPosition`,
            ({ isAttributeDirectionInverted, mouseXPosition, expectedQuantile, expectedYValue }) => {
                //WHEN
                simulateMouseEvent(isAttributeDirectionInverted, mouseXPosition)

                //THEN
                const tooltip = svg.getElementsByClassName("cross-tooltip")[0] as HTMLElement

                expect(tooltip.innerHTML).toContain(`Quantile: ${expectedQuantile}<`)
                expect(tooltip.innerHTML).toContain(`Value: ${expectedYValue}<`)
            }
        )
    })
})
