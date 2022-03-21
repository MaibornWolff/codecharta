import { AttributeTypeValue } from "../../../codeCharta.model"
import { AggregationTypePipe } from "./aggregationType.pipe"

describe("AggregationTypePipe", () => {
	it("should map `AttributeTypeValue.relative` to median", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => AttributeTypeValue.relative
		expect(new AggregationTypePipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("median")
	})

	it("should map `AttributeTypeValue.absolute` to sum", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => AttributeTypeValue.absolute
		expect(new AggregationTypePipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("sum")
	})

	it("should default to sum", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => "" as AttributeTypeValue
		expect(new AggregationTypePipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("sum")
	})
})
