import { CcState } from "../../../../codeCharta.model"
import { clone } from "../../../../util/clone"
import { defaultState } from "../../state.manager"
import { mapColorsSelector } from "./mapColors.selector"

describe("mapColorsSelector", () => {
    const stateWithMarkingColors = (markingColors: unknown): CcState => {
        const state = clone(defaultState)
        state.appSettings.mapColors.markingColors = markingColors as string[]
        return state
    }

    it("should return markingColors unchanged when it is already an array", () => {
        const state = stateWithMarkingColors(["#aaaaaa", "#bbbbbb", "#cccccc"])

        expect(mapColorsSelector(state).markingColors).toEqual(["#aaaaaa", "#bbbbbb", "#cccccc"])
    })

    it("should restore markingColors to an array when it was persisted as an object with numeric keys", () => {
        // some browsers restore the persisted array as a plain object
        const state = stateWithMarkingColors({ 0: "#aaaaaa", 1: "#bbbbbb", 2: "#cccccc" })

        const result = mapColorsSelector(state).markingColors

        expect(Array.isArray(result)).toBe(true)
        expect(result).toEqual(["#aaaaaa", "#bbbbbb", "#cccccc"])
    })
})
