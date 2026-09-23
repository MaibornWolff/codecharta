import { DEFAULT_STATE } from "../../mocks/dataMocks"
import { getPartialDefaultState } from "./getPartialDefaultState"

jest.mock("../../renderer/renderModel/accumulatedData/codeMapNodes.selector", () => ({
    codeMapNodesSelector: jest.fn(() => Array.from({ length: 500 }).fill({}))
}))

describe("getPartialDefaultState", () => {
    it("should reset 'amountOfTopLabels' to a dynamically calculated number, not to the static default", () => {
        const keySettings = ["mapState.amountOfTopLabels"]
        const expectedSettings = { mapState: { amountOfTopLabels: 10 } }

        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        expect(actualSettings).toEqual(expectedSettings)
    })

    it("should reset the radial folder colours to max, tinted at 50 %", () => {
        // Arrange
        const keySettings = ["preferences.radialFolderValue", "preferences.radialFolderStyle", "preferences.radialFolderTint"]

        // Act
        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        // Assert
        expect(actualSettings).toEqual({ preferences: { radialFolderValue: "max", radialFolderStyle: "tinted", radialFolderTint: 0.5 } })
    })

    it("should reset 'labelSize' to its static default of 1", () => {
        const keySettings = ["mapState.labelSize"]
        const expectedSettings = { mapState: { labelSize: 1 } }

        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        expect(actualSettings).toEqual(expectedSettings)
    })
})
