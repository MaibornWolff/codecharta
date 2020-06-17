import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.reducer"
import { ResetCameraIfNewFileIsLoadedAction, setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

describe("resetCameraIfNewFileIsLoaded", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = resetCameraIfNewFileIsLoaded(undefined, {} as ResetCameraIfNewFileIsLoadedAction)

			expect(result).toBeTruthy()
		})
	})

	describe("Action: SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED", () => {
		it("should set new resetCameraIfNewFileIsLoaded", () => {
			const result = resetCameraIfNewFileIsLoaded(true, setResetCameraIfNewFileIsLoaded(false))

			expect(result).toBeFalsy()
		})

		it("should set default resetCameraIfNewFileIsLoaded", () => {
			const result = resetCameraIfNewFileIsLoaded(false, setResetCameraIfNewFileIsLoaded())

			expect(result).toBeTruthy()
		})
	})
})
