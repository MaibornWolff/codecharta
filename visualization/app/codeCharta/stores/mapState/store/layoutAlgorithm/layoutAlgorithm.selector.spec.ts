import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../rootStore/state.manager"
import { isRadialLayoutSelector } from "./layoutAlgorithm.selector"

describe("isRadialLayoutSelector", () => {
    function stateWith(layoutAlgorithm: LayoutAlgorithm) {
        return { ...defaultState, mapState: { ...defaultState.mapState, layoutAlgorithm } }
    }

    it("should report the sunburst layout", () => {
        // Arrange
        const state = stateWith(LayoutAlgorithm.Sunburst)

        // Act
        const isRadialLayout = isRadialLayoutSelector(state)

        // Assert
        expect(isRadialLayout).toBe(true)
    })

    it("should report the radial treemap layout", () => {
        // Arrange
        const state = stateWith(LayoutAlgorithm.RadialTreeMap)

        // Act
        const isRadialLayout = isRadialLayoutSelector(state)

        // Assert
        expect(isRadialLayout).toBe(true)
    })

    it("should not report a 3D layout as a radial one", () => {
        // Arrange
        const state = stateWith(LayoutAlgorithm.SquarifiedTreeMap)

        // Act
        const isRadialLayout = isRadialLayoutSelector(state)

        // Assert
        expect(isRadialLayout).toBe(false)
    })
})
