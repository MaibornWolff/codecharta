import { enableFloorLabels } from "./enableFloorLabels.reducer"
import { setEnableFloorLabels } from "./enableFloorLabels.actions"

describe("enableFloorLabel", () => {
    it("should set new enableFloorLabel", () => {
        const result = enableFloorLabels(true, setEnableFloorLabels({ value: false }))

        expect(result).toBeFalsy()
    })
})
