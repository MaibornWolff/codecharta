import { MapColorLabelPipe } from "./mapColorLabel.pipe"

describe("mapColorLabelPipe", () => {
    const colorRange = { from: 21, to: 42 }
    const nodeMetricDataRange = { minValue: 0, maxValue: 9001 }
    const colorMetric = "mcc"

    it("should transform 'positive'", () => {
        expect(new MapColorLabelPipe().transform("positive", colorRange, nodeMetricDataRange, colorMetric)).toBe("0 to 20")
    })

    it("should transform 'neutral'", () => {
        expect(new MapColorLabelPipe().transform("neutral", colorRange, nodeMetricDataRange, colorMetric)).toBe("21 to 41")
    })

    it("should transform 'negative'", () => {
        expect(new MapColorLabelPipe().transform("negative", colorRange, nodeMetricDataRange, colorMetric)).toBe("42 to 9,001")
    })

    it("should transform 'positiveDelta'", () => {
        expect(new MapColorLabelPipe().transform("positiveDelta", colorRange, nodeMetricDataRange, colorMetric)).toBe("+Δ positive delta")
    })

    it("should transform 'negativeDelta'", () => {
        expect(new MapColorLabelPipe().transform("negativeDelta", colorRange, nodeMetricDataRange, colorMetric)).toBe("–Δ negative delta")
    })

    it("should transform 'selected'", () => {
        expect(new MapColorLabelPipe().transform("selected", colorRange, nodeMetricDataRange, colorMetric)).toBe("selected")
    })

    it("should transform 'outgoingEdge'", () => {
        expect(new MapColorLabelPipe().transform("outgoingEdge", colorRange, nodeMetricDataRange, colorMetric)).toBe("Outgoing Edge")
    })

    it("should transform 'incomingEdge'", () => {
        expect(new MapColorLabelPipe().transform("incomingEdge", colorRange, nodeMetricDataRange, colorMetric)).toBe("Incoming Edge")
    })

    it("should show no matching buildings for positive when from equals min value", () => {
        // Arrange
        const range = { from: 0, to: 42 }

        // Act
        const result = new MapColorLabelPipe().transform("positive", range, nodeMetricDataRange, colorMetric)

        // Assert
        expect(result).toBe("– (no matching buildings)")
    })

    it("should show no matching buildings for neutral when from equals to", () => {
        // Arrange
        const range = { from: 42, to: 42 }

        // Act
        const result = new MapColorLabelPipe().transform("neutral", range, nodeMetricDataRange, colorMetric)

        // Assert
        expect(result).toBe("– (no matching buildings)")
    })

    it("should show no matching buildings for negative when to equals max value", () => {
        // Arrange
        const range = { from: 21, to: 9001 }

        // Act
        const result = new MapColorLabelPipe().transform("negative", range, nodeMetricDataRange, colorMetric)

        // Assert
        expect(result).toBe("– (no matching buildings)")
    })

    it("should not throw when called with default null color range values", () => {
        expect(() => new MapColorLabelPipe().transform("neutral", { from: null, to: null }, nodeMetricDataRange, colorMetric)).not.toThrow()
    })
})
