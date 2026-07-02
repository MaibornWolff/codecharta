import { AttributeTypeValue } from "../../codeCharta.model"
import { _applyPartialState, defaultState } from "./state.manager"
import { expect } from "@jest/globals"
import { clone } from "../../util/clone"

describe("_applyPartialState", () => {
    it("should update partial state", () => {
        const partialState = {
            mapState: {
                invertArea: true
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(newState.mapState.invertArea).toBe(true)
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
            metricsLensSource: {
                attributeTypes: {
                    nodes: {
                        rloc: AttributeTypeValue.absolute
                    }
                }
            },
            fileSettings: {
                blacklist: [
                    {
                        path: "excludedNode",
                        type: "exclude"
                    }
                ]
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(newState.metricsLensSource.attributeTypes.nodes["rloc"]).toBe("absolute")
        expect(newState.fileSettings.blacklist).toEqual([
            {
                path: "excludedNode",
                type: "exclude"
            }
        ])
    })

    it("should keep sharedView.focusedNodePath as an array instead of deep-merging it into an object", () => {
        const partialState = {
            sharedView: {
                focusedNodePath: ["/root/a", "/root/b"]
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(Array.isArray(newState.sharedView.focusedNodePath)).toBe(true)
        expect(newState.sharedView.focusedNodePath).toEqual(["/root/a", "/root/b"])
    })

    it("should keep markingColors as an array instead of deep-merging it into an object", () => {
        const partialState = {
            mapState: {
                mapColors: {
                    markingColors: ["#aaaaaa", "#bbbbbb"]
                }
            }
        }

        const newState = _applyPartialState(clone(defaultState), partialState)

        expect(Array.isArray(newState.mapState.mapColors.markingColors)).toBe(true)
        expect(newState.mapState.mapColors.markingColors).toEqual(["#aaaaaa", "#bbbbbb"])
    })
})
