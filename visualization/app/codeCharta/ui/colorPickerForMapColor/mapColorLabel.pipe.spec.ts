import { MapColorLabelPipe } from "./mapColorLabel.pipe"

describe("mapColorLabelPipe", () => {
	const colorRange = { from: 21.2, to: 41.5, max: 9001, min: 0 }

	it("should transform 'positive'", () => {
		expect(new MapColorLabelPipe().transform("positive", colorRange)).toBe("0 to < 21")
	})

	it("should transform 'neutral'", () => {
		expect(new MapColorLabelPipe().transform("neutral", colorRange)).toBe("≥ 21 to ≤ 42")
	})

	it("should transform 'negative'", () => {
		expect(new MapColorLabelPipe().transform("negative", colorRange)).toBe("> 42 to 9.001")
	})

	it("should transform 'positiveDelta'", () => {
		expect(new MapColorLabelPipe().transform("positiveDelta", colorRange)).toBe("+Δ positive delta")
	})

	it("should transform 'negativeDelta'", () => {
		expect(new MapColorLabelPipe().transform("negativeDelta", colorRange)).toBe("–Δ negative delta")
	})

	it("should transform 'selected'", () => {
		expect(new MapColorLabelPipe().transform("selected", colorRange)).toBe("selected")
	})

	it("should transform 'outgoingEdge'", () => {
		expect(new MapColorLabelPipe().transform("outgoingEdge", colorRange)).toBe("Outgoing Edge")
	})

	it("should transform 'incomingEdge'", () => {
		expect(new MapColorLabelPipe().transform("incomingEdge", colorRange)).toBe("Incoming Edge")
	})
})
