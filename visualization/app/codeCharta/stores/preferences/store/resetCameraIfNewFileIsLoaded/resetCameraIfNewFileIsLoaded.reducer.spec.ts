import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.reducer"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

describe("resetCameraIfNewFileIsLoaded", () => {
    it("should set new resetCameraIfNewFileIsLoaded", () => {
        const result = resetCameraIfNewFileIsLoaded(true, setResetCameraIfNewFileIsLoaded({ value: false }))

        expect(result).toBeFalsy()
    })
})
