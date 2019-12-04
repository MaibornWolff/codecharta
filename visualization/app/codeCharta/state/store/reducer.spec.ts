import { rootReducer } from "./reducer"
import { SETTINGS } from "../../util/dataMocks"
import { setState } from "./state.actions"
import { initialState } from "./initialState"
import { setDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { setMargin } from "./dynamicSettings/margin/margin.actions"

describe("rootReducer", () => {
	it("should update the whole state", () => {
		const result = rootReducer(initialState, setState(SETTINGS))

		expect(result).toEqual(SETTINGS)
	})

	it("should partial state (all metrics)", () => {
		const partialState = {
			areaMetric: "another_area_metric",
			heightMetric: "another_height_metric",
			colorMetric: "another_color_metric"
		}

		const result = rootReducer(initialState, setDynamicSettings(partialState))

		expect(result.appSettings).toEqual(initialState.appSettings)
		expect(result.fileSettings).toEqual(initialState.fileSettings)
		expect(result.dynamicSettings.areaMetric).toEqual(partialState.areaMetric)
		expect(result.dynamicSettings.heightMetric).toEqual(partialState.heightMetric)
		expect(result.dynamicSettings.colorMetric).toEqual(partialState.colorMetric)
		expect(result.dynamicSettings.margin).toEqual(initialState.dynamicSettings.margin)
	})

	it("should update a single property", () => {
		const result = rootReducer(initialState, setMargin(20))

		expect(result.dynamicSettings.margin).toEqual(20)
	})
})
