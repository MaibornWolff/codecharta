import { AttributeTypeValue } from "../../codeCharta.model"
import { AggregationSymbolPipe } from "./aggregationSymbol.pipe"

describe("aggregationSymbolPipe", () => {
	it("should map `AttributeTypeValue.relative` to x͂", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => AttributeTypeValue.relative
		expect(new AggregationSymbolPipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("x͂")
	})

	it("should map `AttributeTypeValue.absolute` to Σ", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => AttributeTypeValue.absolute
		expect(new AggregationSymbolPipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("Σ")
	})

	it("should default to Σ", () => {
		const getAttributeTypeOfNodesByMetricSelector = () => "" as AttributeTypeValue
		expect(new AggregationSymbolPipe().transform("some-metric-name", getAttributeTypeOfNodesByMetricSelector)).toBe("Σ")
	})
})
