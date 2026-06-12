import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"

describe("MetricColorRangeDiagramComponent", () => {
    const values = [1, 2, 2, 3, 5, 8]

    async function setup(inputs: Partial<MetricColorRangeDiagramComponent> = {}) {
        const result = await render(MetricColorRangeDiagramComponent, {
            inputs: {
                minValue: 1,
                maxValue: 8,
                colorMetric: "rloc",
                values,
                currentLeftValue: 2,
                currentRightValue: 5,
                leftColor: "#ff0000",
                middleColor: "#ffff00",
                rightColor: "#00ff00",
                isAttributeDirectionInverted: false,
                ...inputs
            },
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
        return result.fixture.componentInstance as any
    }

    it("should render an svg diagram into the container when values are present", async () => {
        // Arrange & Act
        const component = await setup()

        // Assert
        const svg = component["elementRef"].nativeElement.querySelector("#cc-range-diagram-container svg")
        expect(svg).not.toBeNull()
    })

    it("should return 0 for the min value and 100 for the max value", async () => {
        // Arrange
        const component = await setup()

        // Act
        const atMin = component.calculatePercentileFromMetricValue(1)
        const atMax = component.calculatePercentileFromMetricValue(8)

        // Assert
        expect(atMin).toBe(0)
        expect(atMax).toBe(100)
    })

    it("should return a finite percentile for a value between min and max", async () => {
        // Arrange
        const component = await setup()

        // Act
        const percentile = component.calculatePercentileFromMetricValue(3)

        // Assert
        expect(Number.isFinite(percentile)).toBe(true)
        expect(percentile).toBeGreaterThan(0)
        expect(percentile).toBeLessThan(100)
    })

    it("should return a finite percentile (terminal return) when metric value exceeds the max", async () => {
        // Arrange
        const component = await setup()

        // Act
        const percentile = component.calculatePercentileFromMetricValue(999)

        // Assert
        expect(Number.isFinite(percentile)).toBe(true)
        expect(Number.isNaN(percentile)).toBe(false)
        expect(percentile).toBe(100)
    })

    it("should return 0 at max and 100 at min for the reversed percentile calculation", async () => {
        // Arrange
        const component = await setup({ isAttributeDirectionInverted: true })

        // Act
        const atMax = component.calculateReversedPercentileFromMetricValue(8)
        const atMin = component.calculateReversedPercentileFromMetricValue(1)

        // Assert
        expect(atMax).toBe(0)
        expect(atMin).toBe(100)
    })

    it("should return a finite reversed percentile (terminal return) when metric value is below the min", async () => {
        // Arrange
        const component = await setup({ isAttributeDirectionInverted: true })

        // Act
        const percentile = component.calculateReversedPercentileFromMetricValue(-999)

        // Assert
        expect(Number.isFinite(percentile)).toBe(true)
        expect(Number.isNaN(percentile)).toBe(false)
        expect(percentile).toBe(100)
    })

    it("should return a finite percentile (not null/NaN) when metric value is below the min", async () => {
        // Arrange
        const component = await setup()

        // Act
        const percentile = component.calculatePercentileFromMetricValue(-999)

        // Assert
        expect(Number.isFinite(percentile)).toBe(true)
        expect(Number.isNaN(percentile)).toBe(false)
        expect(percentile).toBe(0)
    })

    it("should return a finite reversed percentile (not null/NaN) when metric value exceeds the max", async () => {
        // Arrange
        const component = await setup({ isAttributeDirectionInverted: true })

        // Act
        const percentile = component.calculateReversedPercentileFromMetricValue(999)

        // Assert
        expect(Number.isFinite(percentile)).toBe(true)
        expect(Number.isNaN(percentile)).toBe(false)
        expect(percentile).toBe(0)
    })

    it("should build a percentile-to-metric-value map covering every percentile from 0 to 100", async () => {
        // Arrange
        const component = await setup()

        // Act
        const map = component["percentileToMetricValueMap"] as Map<number, number>

        // Assert
        expect(map.size).toBe(101)
        for (let percentile = 0; percentile <= 100; percentile++) {
            expect(Number.isFinite(map.get(percentile))).toBe(true)
        }
    })

    it("should size the svg according to diagramWidth and diagramHeight", async () => {
        // Arrange & Act
        const component = await setup({ diagramWidth: 380, diagramHeight: 190 })

        // Assert
        const svg = component["elementRef"].nativeElement.querySelector("#cc-range-diagram-container svg")
        expect(svg.getAttribute("width")).toBe("380")
        expect(svg.getAttribute("height")).toBe("190")
    })

    it("should render the axis labels by default", async () => {
        // Arrange & Act
        const component = await setup()

        // Assert
        const container = component["elementRef"].nativeElement
        expect(container.querySelector("#y-label")).not.toBeNull()
        expect(container.querySelector("#x-label")).not.toBeNull()
    })

    it("should hide the axis labels when showAxisLabels is false", async () => {
        // Arrange & Act
        const component = await setup({ showAxisLabels: false })

        // Assert
        const container = component["elementRef"].nativeElement
        expect(container.querySelector("#y-label")).toBeNull()
        expect(container.querySelector("#x-label")).toBeNull()
    })
})
