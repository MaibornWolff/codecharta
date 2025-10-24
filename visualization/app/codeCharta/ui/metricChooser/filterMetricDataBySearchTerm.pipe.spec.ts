import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { NodeMetricData } from "../../codeCharta.model"

describe("FilterMetricDataBySearchTermPipe", () => {
    let pipe: FilterMetricDataBySearchTermPipe
    let metricData: NodeMetricData[]

    beforeEach(() => {
        pipe = new FilterMetricDataBySearchTermPipe()
        metricData = [
            { name: "max_complexity_per_file", maxValue: 100, minValue: 0, values: [10] },
            { name: "average_line_count", maxValue: 500, minValue: 0, values: [100] },
            { name: "total-test-coverage", maxValue: 100, minValue: 0, values: [80] },
            { name: "code quality score", maxValue: 10, minValue: 0, values: [7] },
            { name: "complexity", maxValue: 50, minValue: 0, values: [25] },
            { name: "sonar_complexity", maxValue: 50, minValue: 0, values: [30] },
            { name: "rloc", maxValue: 1000, minValue: 0, values: [500] }
        ]
    })

    describe("delimiter normalization", () => {
        it("should match metrics with underscores when searching with spaces", () => {
            // Arrange
            const searchTerm = "complexity per file"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should match metrics with hyphens when searching with spaces", () => {
            // Arrange
            const searchTerm = "test coverage"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("total-test-coverage")
        })

        it("should match metrics with spaces when searching with underscores", () => {
            // Arrange
            const searchTerm = "quality_score"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("code quality score")
        })

        it("should match metrics regardless of delimiter type", () => {
            // Arrange
            const searchTerm = "average-line_count"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("average_line_count")
        })
    })

    describe("word order independence", () => {
        it("should match metrics with search words in different order", () => {
            // Arrange
            const searchTerm = "file complexity"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should match metrics when searching for non-consecutive words", () => {
            // Arrange
            const searchTerm = "max file"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should match multiple metrics when search terms are common", () => {
            // Arrange
            const searchTerm = "complexity"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(3)
            expect(results.map(r => r.name)).toContain("max_complexity_per_file")
            expect(results.map(r => r.name)).toContain("complexity")
            expect(results.map(r => r.name)).toContain("sonar_complexity")
        })
    })

    describe("partial word matching", () => {
        it("should match partial words anywhere in metric name", () => {
            // Arrange
            const searchTerm = "comple"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(3)
            expect(results.some(r => r.name.includes("complexity"))).toBe(true)
        })

        it("should match partial words at the beginning", () => {
            // Arrange
            const searchTerm = "max"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should match partial words at the end", () => {
            // Arrange
            const searchTerm = "file"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })
    })

    describe("special case handling (formerly mcc)", () => {
        it("should match 'complexity' when searching for 'mcc'", () => {
            // Arrange
            const searchTerm = "mcc"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(2)
            expect(results.map(r => r.name)).toContain("complexity")
            expect(results.map(r => r.name)).toContain("sonar_complexity")
        })

        it("should match 'complexity' when searching for 'formerly'", () => {
            // Arrange
            const searchTerm = "formerly"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(2)
            expect(results.map(r => r.name)).toContain("complexity")
            expect(results.map(r => r.name)).toContain("sonar_complexity")
        })

        it("should still match 'complexity' with normal search", () => {
            // Arrange
            const searchTerm = "complexity"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(3)
        })
    })

    describe("case insensitivity", () => {
        it("should match regardless of case", () => {
            // Arrange
            const searchTerm = "COMPLEXITY PER FILE"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should match with mixed case", () => {
            // Arrange
            const searchTerm = "CoMpLeXiTy"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(3)
        })
    })

    describe("edge cases", () => {
        it("should return all metrics when search term is empty", () => {
            // Arrange
            const searchTerm = ""

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(metricData.length)
        })

        it("should return empty array when no metrics match", () => {
            // Arrange
            const searchTerm = "nonexistent_metric"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(0)
        })

        it("should handle multiple consecutive spaces in search term", () => {
            // Arrange
            const searchTerm = "complexity    per    file"

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(1)
            expect(results[0].name).toBe("max_complexity_per_file")
        })

        it("should handle search terms with leading/trailing spaces", () => {
            // Arrange
            const searchTerm = "  complexity  "

            // Act
            const results = pipe.transform(metricData, searchTerm)

            // Assert
            expect(results.length).toBe(3)
        })
    })
})
