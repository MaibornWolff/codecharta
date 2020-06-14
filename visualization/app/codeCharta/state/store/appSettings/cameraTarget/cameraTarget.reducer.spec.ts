import { cameraTarget } from "./cameraTarget.reducer"
import { CameraTargetAction, setCameraTarget } from "./cameraTarget.actions"
import { Vector3 } from "three"

describe("cameraTarget", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = cameraTarget(undefined, {} as CameraTargetAction)

			expect(result).toEqual(new Vector3(177, 0, 299))
		})
	})

	describe("Action: SET_CAMERA_TARGET", () => {
		it("should set new cameraTarget", () => {
			const result = cameraTarget(new Vector3(177, 0, 299), setCameraTarget(new Vector3(100, 100, 100)))

			expect(result).toEqual(new Vector3(100, 100, 100))
		})

		it("should set default cameraTarget", () => {
			const result = cameraTarget(new Vector3(100, 100, 100), setCameraTarget())

			expect(result).toEqual(new Vector3(177, 0, 299))
		})
	})
})
