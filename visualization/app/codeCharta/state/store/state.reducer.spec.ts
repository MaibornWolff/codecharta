import { TestBed } from "@angular/core/testing"
import { AttributeTypeValue, RecursivePartial, State } from "../../codeCharta.model"
import rootReducer from "./state.manager"
import { defaultState, setState } from "./state.actions"
import { expect } from "@jest/globals"
import { defaultInvertArea } from "./appSettings/invertArea/invertArea.actions"
import { clone } from "../../util/clone"
import { Store } from "../angular-redux/store"
import { marginSelector } from "./dynamicSettings/margin/margin.selector"
import { defaultMargin } from "./dynamicSettings/margin/margin.actions"

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
						type: "exclude"
					}
				]
			}
		}

		const newState = rootReducer(clone(defaultState), setState(partialState))

		expect(newState.fileSettings.attributeTypes.nodes["rloc"]).toBe("absolute")
		expect(newState.fileSettings.blacklist).toEqual([
			{
				path: "excludedNode",
				type: "exclude"
			}
		])
	})

	it("should return a new reference of every (nested) object, so that selectors trigger again", () => {
		const store = TestBed.inject(Store)
		const partialState = {
			dynamicSettings: {
				margin: 20
			}
		} as RecursivePartial<State>

		const marginChangedSpy = jest.fn()
		store.select(marginSelector).subscribe(marginChangedSpy)
		store.dispatch(setState(partialState))

		expect(marginChangedSpy).toHaveBeenCalledTimes(2)
		expect(marginChangedSpy.mock.calls[0][0]).toBe(defaultMargin)
		expect(marginChangedSpy.mock.calls[1][0]).toBe(20)
	})
})
