import { AttributeTypeValue } from "../../codeCharta.model"
import { NodeMetricAggregationTypePipe } from "./nodeMetricAggregationType.pipe"

describe("NodeMetricAggregationType", () => {
	it("should use getAttributeTypeOfNodesByMetricSelector", () => {
		const getAttributeTypeOfNodesByMetricSelector = (metricName: string) =>
			metricName === "someAbsoluteMetric" ? AttributeTypeValue.absolute : AttributeTypeValue.relative
		expect(new NodeMetricAggregationTypePipe().transform("someAbsoluteMetric", getAttributeTypeOfNodesByMetricSelector)).toBe(
			AttributeTypeValue.absolute
		)
		expect(new NodeMetricAggregationTypePipe().transform("someRelativeMetric", getAttributeTypeOfNodesByMetricSelector)).toBe(
			AttributeTypeValue.relative
		)
	})
})
