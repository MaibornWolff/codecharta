import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../rootStore/state.manager"
import { isSunburstLayoutSelector } from "./layoutAlgorithm.selector"

describe("isSunburstLayoutSelector", () => {
    function stateWith(layoutAlgorithm: LayoutAlgorithm) {
        return { ...defaultState, mapState: { ...defaultState.mapState, layoutAlgorithm } }
    }

    it("should report the sunburst layout", () => {
        // Arrange
        const state = stateWith(LayoutAlgorithm.Sunburst)

        // Act
        const isSunburst = isSunburstLayoutSelector(state)

        // Assert
        expect(isSunburst).toBe(true)
    })

    it("should not report a 3D layout as the sunburst", () => {
        // Arrange
        const state = stateWith(LayoutAlgorithm.SquarifiedTreeMap)

        // Act
        const isSunburst = isSunburstLayoutSelector(state)

        // Assert
        expect(isSunburst).toBe(false)
    })
})
