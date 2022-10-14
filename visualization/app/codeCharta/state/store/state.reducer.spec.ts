import { RecursivePartial, State } from "../../codeCharta.model"
import rootReducer from "./state.reducer"
import { defaultState, setState } from "./state.actions"
import { expect } from "@jest/globals"
import { defaultInvertArea } from "./appSettings/invertArea/invertArea.actions"
import { clone } from "../../util/clone"

describe("rootReducer", () => {
	it("should update partial state", () => {
		const partialState: RecursivePartial<State> = {
			appSettings: {
				invertArea: true
			}
		}

		const newState = rootReducer(clone(defaultState), setState(partialState))

		expect(newState.appSettings.invertArea).not.toBe(defaultInvertArea)
		expect(newState.appSettings.experimentalFeaturesEnabled).toBe(defaultState.appSettings.experimentalFeaturesEnabled)
	})

	it("should throw error when a key does not exist", () => {
		const partialState = {
			dynamicSettings: {
				test: "doesn't exist"
			}
		} as RecursivePartial<State>

		expect(() => rootReducer(clone(defaultState), setState(partialState))).toThrowError(
			'cannot restore key "test" as it doesn\'t exist in store'
		)
	})
})
