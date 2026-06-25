import { getPartialDefaultState } from "./getPartialDefaultState"
import { DEFAULT_STATE } from "../../../mocks/dataMocks"

jest.mock("../../../state/selectors/accumulatedData/codeMapNodes.selector", () => ({
    codeMapNodesSelector: jest.fn(() => Array.from({ length: 500 }).fill({}))
}))

describe("getPartialDefaultState", () => {
    it("should reset 'amountOfTopLabels' to a dynamically calculated number, not to the static default", () => {
        const keySettings = ["appSettings.amountOfTopLabels"]
        const expectedSettings = { appSettings: { amountOfTopLabels: 10 } }

        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        expect(actualSettings).toEqual(expectedSettings)
    })

    it("should reset 'labelSize' to its static default of 1", () => {
        const keySettings = ["appSettings.labelSize"]
        const expectedSettings = { appSettings: { labelSize: 1 } }

        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        expect(actualSettings).toEqual(expectedSettings)
    })
})
