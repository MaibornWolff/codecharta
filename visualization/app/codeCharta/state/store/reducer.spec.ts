import rootReducer from "./reducer"
import { STATE } from "../../util/dataMocks"
import { defaultState, setState } from "./state.actions"
import { setDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { setMargin } from "./dynamicSettings/margin/margin.actions"

describe("rootReducer", () => {
	it("should update the whole state", () => {
		const result = rootReducer(defaultState, setState(STATE))

		expect(result).toEqual(STATE)
	})

	it("should partial state (all metrics)", () => {
		const partialState = {
			areaMetric: "another_area_metric",
			heightMetric: "another_height_metric",
			colorMetric: "another_color_metric"
		}

		const result = rootReducer(defaultState, setDynamicSettings(partialState))

		expect(result.appSettings).toEqual(defaultState.appSettings)
		expect(result.fileSettings).toEqual(defaultState.fileSettings)
		expect(result.dynamicSettings.areaMetric).toEqual(partialState.areaMetric)
		expect(result.dynamicSettings.heightMetric).toEqual(partialState.heightMetric)
		expect(result.dynamicSettings.colorMetric).toEqual(partialState.colorMetric)
		expect(result.dynamicSettings.margin).toEqual(defaultState.dynamicSettings.margin)
	})

	it("should update a single property", () => {
		const result = rootReducer(defaultState, setMargin(20))

		expect(result.dynamicSettings.margin).toEqual(20)
	})

	it("should reset the state to default", () => {
		const result = rootReducer(STATE, setState(defaultState))

		expect(result).toEqual(defaultState)
	})
})
