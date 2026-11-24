import { CategorizedMetricDistribution, MetricDistribution, NO_EXTENSION } from "../../../util/fileExtension/fileExtensionCalculator"
import { extensionsGroupedIntoOther } from "./extensionsGroupedIntoOther"

function distributionOf(fileExtension: string, absoluteMetricValue: number): MetricDistribution {
    return { fileExtension, absoluteMetricValue, relativeMetricValue: absoluteMetricValue, color: "#fff" }
}

describe("extensionsGroupedIntoOther", () => {
    const yml = distributionOf("yml", 2)
    const md = distributionOf("md", 1)
    const none = distributionOf(NO_EXTENSION, 1.5)
    const ts = distributionOf("ts", 90)

    it("should list the other extensions together with 'None' when 'None' was merged into 'other'", () => {
        // Arrange
        const distribution: CategorizedMetricDistribution = {
            visible: [ts, distributionOf("other", 4.5)],
            others: [yml, md],
            none: [none]
        }

        // Act
        const grouped = extensionsGroupedIntoOther(distribution)

        // Assert
        expect(grouped).toEqual([yml, none, md])
    })

    it("should leave out 'None' when it has a segment of its own", () => {
        // Arrange
        const distribution: CategorizedMetricDistribution = {
            visible: [ts, none, distributionOf("other", 3)],
            others: [yml, md],
            none: [none]
        }

        // Act
        const grouped = extensionsGroupedIntoOther(distribution)

        // Assert
        expect(grouped).toEqual([yml, md])
    })

    it("should be empty when nothing was grouped into 'other'", () => {
        // Arrange
        const distribution: CategorizedMetricDistribution = { visible: [ts, none], others: [], none: [none] }

        // Act
        const grouped = extensionsGroupedIntoOther(distribution)

        // Assert
        expect(grouped).toEqual([])
    })
})
