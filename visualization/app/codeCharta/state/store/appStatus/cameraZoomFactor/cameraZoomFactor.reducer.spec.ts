import { setCameraZoomFactor } from "./cameraZoomFactor.actions"
import { cameraZoomFactor } from "./cameraZoomFactor.reducer"

describe("cameraZoomFactor", () => {
    it("should set the cameraZoomFactor to correctly", () => {
        expect(cameraZoomFactor(1, setCameraZoomFactor({ value: 5 }))).toBe(5)
    })
})
