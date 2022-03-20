import { AttributeTypeValue } from "../../codeCharta.model"
import { NodeMetricAggregationTypePipe } from "./nodeMetricAggregationType.pipe"

describe("NodeMetricAggregationType", () => {
	it("should use getAttributeType", () => {
		const getAttributeType = (_, metricName: string) =>
			metricName === "someAbsoluteMetric" ? AttributeTypeValue.absolute : AttributeTypeValue.relative
		expect(new NodeMetricAggregationTypePipe().transform("someAbsoluteMetric", getAttributeType)).toBe(AttributeTypeValue.absolute)
		expect(new NodeMetricAggregationTypePipe().transform("someRelativeMetric", getAttributeType)).toBe(AttributeTypeValue.relative)
	})
})
