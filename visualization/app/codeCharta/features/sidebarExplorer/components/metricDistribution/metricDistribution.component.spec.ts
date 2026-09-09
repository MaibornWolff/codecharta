import { render, screen } from "@testing-library/angular"
import { bucketValues } from "../../../../util/metricRule/bucketValues"
import { MetricDistributionComponent } from "./metricDistribution.component"

const distributionOf = (values: number[], isMatched: (value: number) => boolean = () => false) => bucketValues(values, 4, isMatched)

describe("MetricDistributionComponent", () => {
    it("should render one bar per bucket", async () => {
        // Arrange & Act
        const { container } = await render(MetricDistributionComponent, {
            inputs: { distribution: distributionOf([1, 2, 3, 4, 5, 6, 7, 8]), metric: "mcc" }
        })

        // Assert
        expect(container.querySelectorAll("[data-testid='metric-distribution'] span[title]").length).toBe(4)
    })

    it("should render the range of the values", async () => {
        // Arrange & Act
        await render(MetricDistributionComponent, {
            inputs: { distribution: distributionOf([3, 17]), metric: "mcc" }
        })

        // Assert
        expect(screen.getByText("3")).not.toBe(null)
        expect(screen.getByText("17")).not.toBe(null)
    })

    it("should fill each bar by the share of its files the rule matches", async () => {
        // Arrange & Act — 6 and 7 share the last bucket with nothing else, 4 and 5 the one before
        const { container } = await render(MetricDistributionComponent, {
            inputs: { distribution: distributionOf([0, 1, 2, 3, 4, 5, 6, 7], value => value >= 6), metric: "mcc" }
        })

        // Assert
        const matchedFills = [...container.querySelectorAll<HTMLElement>("[data-testid='metric-distribution'] span[title] > span")]
        expect(matchedFills.map(fill => fill.style.height)).toEqual(["0%", "0%", "0%", "100%"])
    })

    it("should fill only part of a bar whose files straddle the threshold", async () => {
        // Arrange & Act — one bucket holding 6 and 7, of which only 7 matches
        const { container } = await render(MetricDistributionComponent, {
            inputs: { distribution: bucketValues([6, 7], 1, value => value >= 7), metric: "mcc" }
        })

        // Assert
        const fill = container.querySelector<HTMLElement>("[data-testid='metric-distribution'] span[title] > span")
        expect(fill?.style.height).toBe("50%")
    })

    it("should render nothing when there is no distribution", async () => {
        // Arrange & Act
        await render(MetricDistributionComponent, {
            inputs: { distribution: distributionOf([]), metric: "mcc" }
        })

        // Assert
        expect(screen.queryByTestId("metric-distribution")).toBe(null)
    })

    it("should give a bucket that has files a visible height", async () => {
        // Arrange & Act
        const { container } = await render(MetricDistributionComponent, {
            // one outlier against a tall first bucket: its bar would otherwise round away to nothing
            inputs: { distribution: bucketValues([...Array.from({ length: 400 }, () => 1), 100], 4), metric: "mcc" }
        })

        // Assert
        const bars = [...container.querySelectorAll<HTMLElement>("[data-testid='metric-distribution'] span[title]")]
        expect(bars.at(-1)?.style.height).toBe("6%")
    })
})
