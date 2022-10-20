import { AttributeTypeValue, BlacklistType, RecursivePartial, State } from "../../codeCharta.model"
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

	it("should not update state property when a key does not exist", () => {
		const partialState = {
			dynamicSettings: {
				notValidKey: "doesn't exist"
			}
		} as RecursivePartial<State>

		const newState = rootReducer(clone(defaultState), setState(partialState))

		expect(newState.dynamicSettings["notValidKey"]).toBeUndefined()
	})

	it("should update partial state with objects that have dynamic keys ", () => {
		const partialState: RecursivePartial<State> = {
			fileSettings: {
				attributeTypes: {
					nodes: {
						rloc: AttributeTypeValue.absolute
					}
				},
				blacklist: [
					{
						path: "excludedNode",
						type: BlacklistType.exclude
					}
				]
			}
		}

		const newState = rootReducer(clone(defaultState), setState(partialState))

		expect(newState.fileSettings.attributeTypes.nodes["rloc"]).toBe("absolute")
		expect(newState.fileSettings.blacklist).toEqual([
			{
				path: "excludedNode",
				type: BlacklistType.exclude
			}
		])
	})
})
