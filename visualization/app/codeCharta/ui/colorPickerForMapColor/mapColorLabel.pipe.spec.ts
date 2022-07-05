import { MapColorLabelPipe } from "./mapColorLabel.pipe"

describe("mapColorLabelPipe", () => {
	const colorRange = { from: 21, to: 42 }
	const nodeMetricDataRange = { minValue: 0, maxValue: 9001 }

	it("should transform 'positive'", () => {
		expect(new MapColorLabelPipe().transform("positive", colorRange, nodeMetricDataRange)).toBe("0 to < 21")
	})

	it("should transform 'neutral'", () => {
		expect(new MapColorLabelPipe().transform("neutral", colorRange, nodeMetricDataRange)).toBe("≥ 21 to ≤ 42")
	})

	it("should transform 'negative'", () => {
		expect(new MapColorLabelPipe().transform("negative", colorRange, nodeMetricDataRange)).toBe("> 42 to 9,001")
	})

	it("should transform 'positiveDelta'", () => {
		expect(new MapColorLabelPipe().transform("positiveDelta", colorRange, nodeMetricDataRange)).toBe("+Δ positive delta")
	})

	it("should transform 'negativeDelta'", () => {
		expect(new MapColorLabelPipe().transform("negativeDelta", colorRange, nodeMetricDataRange)).toBe("–Δ negative delta")
	})

	it("should transform 'selected'", () => {
		expect(new MapColorLabelPipe().transform("selected", colorRange, nodeMetricDataRange)).toBe("selected")
	})

	it("should transform 'outgoingEdge'", () => {
		expect(new MapColorLabelPipe().transform("outgoingEdge", colorRange, nodeMetricDataRange)).toBe("Outgoing Edge")
	})

	it("should transform 'incomingEdge'", () => {
		expect(new MapColorLabelPipe().transform("incomingEdge", colorRange, nodeMetricDataRange)).toBe("Incoming Edge")
	})

	it("should not throw when called with default null color range values", () => {
		expect(() => new MapColorLabelPipe().transform("incomingEdge", { from: null, to: null }, nodeMetricDataRange)).not.toThrow()
	})
})
