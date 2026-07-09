import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"
import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.reducer"

describe("resetCameraIfNewFileIsLoaded", () => {
    it("should set new resetCameraIfNewFileIsLoaded", () => {
        const result = resetCameraIfNewFileIsLoaded(true, setResetCameraIfNewFileIsLoaded({ value: false }))

        expect(result).toBeFalsy()
    })
})
