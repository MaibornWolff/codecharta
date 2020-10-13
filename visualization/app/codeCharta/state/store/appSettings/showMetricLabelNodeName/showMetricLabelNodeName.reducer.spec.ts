import { showMetricLabelNodeName } from "./showMetricLabelNodeName.reducer"
import { ShowMetricLabelNodeNameAction, setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

describe("showMetricLabelNodeName", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = showMetricLabelNodeName(undefined, {} as ShowMetricLabelNodeNameAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_SHOW_METRIC_LABEL_NODE_NAME", () => {
		it("should set new showMetricLabelNodeName", () => {
			const result = showMetricLabelNodeName(true, setShowMetricLabelNodeName(false))

			expect(result).toEqual(false)
		})

		it("should set default showMetricLabelNodeName", () => {
        	const result = showMetricLabelNodeName(false, setShowMetricLabelNodeName())

        	expect(result).toEqual(true)
        })
	})
})
