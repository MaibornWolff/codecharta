import "./threeViewer.module"
import { ThreeCameraService } from "./threeCameraService"
import { instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { PerspectiveCamera, Vector3 } from "three"

describe("ThreeCameraService", () => {
	let threeCameraService: ThreeCameraService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")
	}

	function rebuildService() {
		threeCameraService = new ThreeCameraService()
		threeCameraService.camera = new PerspectiveCamera()
	}

	describe("init", () => {
		it("should set camera with a new aspect", () => {
			threeCameraService.init(400, 200)
			expect(threeCameraService.camera.aspect).toBe(2)
		})

		it("should call setPosition with x, y and z", () => {
			threeCameraService.setPosition = jest.fn()
			threeCameraService.init(400, 200)
			expect(threeCameraService.setPosition).toHaveBeenCalled()
		})
	})

	describe("setPosition", () => {
		it("should set camera position correctly", () => {
			threeCameraService.setPosition(new Vector3(1, 2, 3))
			expect(threeCameraService.camera.position).toEqual({ x: 1, y: 2, z: 3 })
		})
	})
})
