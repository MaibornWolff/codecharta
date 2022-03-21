import { GetAttributeType } from "../../state/selectors/getAttributeTypeOfNodesByMetric.selector"
import { AggregationTypePipe } from "./aggregationType.pipe"

describe("AggregationType", () => {
	const aggregationTypePipe = new AggregationTypePipe()
	const aggregationTypes = {
		nodes: { rloc: "absolute" },
		edges: { mcc: "relative" }
	}
	const getAttributeType: GetAttributeType = (metricType, metricName) => aggregationTypes[metricType][metricName]

	it("should default to 'absolute", () => {
		expect(aggregationTypePipe.transform(getAttributeType, "nodes", "non-existing")).toBe("absolute")
	})

	it("should get nodes value", () => {
		expect(aggregationTypePipe.transform(getAttributeType, "nodes", "rloc")).toBe("absolute")
	})

	it("should get edges value", () => {
		expect(aggregationTypePipe.transform(getAttributeType, "edges", "mcc")).toBe("relative")
	})
})
