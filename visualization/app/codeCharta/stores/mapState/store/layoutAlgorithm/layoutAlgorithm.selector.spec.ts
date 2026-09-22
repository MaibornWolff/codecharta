import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../rootStore/state.manager"
import { isSunburstLayoutSelector } from "./layoutAlgorithm.selector"

describe("isSunburstLayoutSelector", () => {
    function stateWith(layoutAlgorithm: LayoutAlgorithm) {
        return { ...defaultState, mapState: { ...defaultState.mapState, layoutAlgorithm } }
    }

    it("should tell whether the map is shown as a sunburst", () => {
        // Assert
        expect(isSunburstLayoutSelector(stateWith(LayoutAlgorithm.Sunburst))).toBe(true)
        expect(isSunburstLayoutSelector(stateWith(LayoutAlgorithm.SquarifiedTreeMap))).toBe(false)
    })
})
