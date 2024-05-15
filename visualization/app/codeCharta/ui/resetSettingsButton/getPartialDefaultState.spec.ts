import { getPartialDefaultState } from "./getPartialDefaultState"
import { DEFAULT_STATE } from "../../util/dataMocks"

jest.mock("../../state/selectors/accumulatedData/codeMapNodes.selector", () => ({
    codeMapNodesSelector: jest.fn(() => Array.from({ length: 500 }).fill({}))
}))

describe("getPartialDefaultState", () => {
    it("should reset 'amountOfTopLabels' to a dynamically calculated number, not to the static 'defaultAmountOfLabels' of 1", () => {
        const keySettings = ["appSettings.amountOfTopLabels"]
        const expectedSettings = { appSettings: { amountOfTopLabels: 5 } }

        const actualSettings = getPartialDefaultState(keySettings, DEFAULT_STATE)

        expect(actualSettings).toEqual(expectedSettings)
    })
})
