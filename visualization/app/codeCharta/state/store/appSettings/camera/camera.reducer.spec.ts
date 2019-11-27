import { camera } from "./camera.reducer"
import { CameraAction, setCamera } from "./camera.actions"

describe("camera", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = camera(undefined, {} as CameraAction)

			expect(result).toEqual(new Vector3(0, 300, 1000))
		})
	})

	describe("Action: SET_CAMERA", () => {
		it("should set new camera", () => {
			const result = camera(new Vector3(0, 300, 1000), setCamera(new Vector(0, 1, 2)))

			expect(result).toEqual(new Vector(0, 1, 2))
		})
	})
})
