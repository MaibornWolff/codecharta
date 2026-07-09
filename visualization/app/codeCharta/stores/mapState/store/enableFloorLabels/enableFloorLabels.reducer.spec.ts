import { setEnableFloorLabels } from "./enableFloorLabels.actions"
import { enableFloorLabels } from "./enableFloorLabels.reducer"

describe("enableFloorLabel", () => {
    it("should set new enableFloorLabel", () => {
        const result = enableFloorLabels(true, setEnableFloorLabels({ value: false }))

        expect(result).toBeFalsy()
    })
})
