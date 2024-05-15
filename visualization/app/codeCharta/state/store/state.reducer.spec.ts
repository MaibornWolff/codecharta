import { AttributeTypeValue } from "../../codeCharta.model"
import { _applyPartialState, defaultState } from "./state.manager"
import { expect } from "@jest/globals"
import { clone } from "../../util/clone"

describe("_applyPartialState", () => {
    it("should update partial state", () => {
        const partialState = {
            appSettings: {
                invertArea: true
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(newState.appSettings.invertArea).toBe(true)
        expect(newState.appSettings.experimentalFeaturesEnabled).toBe(defaultState.appSettings.experimentalFeaturesEnabled)
    })

    it("should not update state property when a key does not exist", () => {
        const partialState = {
            dynamicSettings: {
                notValidKey: "doesn't exist"
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(newState.dynamicSettings["notValidKey"]).toBeUndefined()
    })

    it("should update partial state with objects that have dynamic keys ", () => {
        const partialState = {
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

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(newState.fileSettings.attributeTypes.nodes["rloc"]).toBe("absolute")
        expect(newState.fileSettings.blacklist).toEqual([
            {
                path: "excludedNode",
                type: "exclude"
            }
        ])
    })
})
