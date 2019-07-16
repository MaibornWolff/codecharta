import "./threeViewer.module"
import { NG, getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService } from "angular"
import * as THREE from "three"
import { OrbitControls, PerspectiveCamera, Vector3 } from "three"

describe("ThreeOrbitControlsService", () => {
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let threeOrbitControlsService: ThreeOrbitControlsService

	let vector: Vector3

	afterEach(() => {
		jest.resetAllMocks()
	})

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		$rootScope = getService<IRootScopeService>("$rootScope")

		vector = new Vector3(4.4577067775672665, 4.4577067775672665, 4.4577067775672665)
	}

	function withMockedThreeCameraService() {
		threeCameraService = threeOrbitControlsService["threeCameraService"] = jest.fn<ThreeCameraService>(() => {
			return {
				camera: {
					position: {
						distanceTo: jest.fn(() => {
							return 1
						}),
						set: jest.fn()
					},
					lookAt: jest.fn(),
					translateZ: jest.fn(),
					updateProjectionMatrix: jest.fn(),
					fov: 100,
					clone: jest.fn(() => {
						const camera = new PerspectiveCamera()
						camera.position.set(vector.x, vector.y, vector.z)
						return camera
					})
				}
			}
		})()
	}

	function withMockedThreeSceneService() {
		threeSceneService = threeOrbitControlsService["threeSceneService"] = jest.fn<ThreeSceneService>(() => {
			return {
				scene: {
					add: jest.fn(),
					remove: jest.fn()
				}
			}
		})()
	}

	function rebuildService() {
		threeOrbitControlsService = new ThreeOrbitControlsService(threeCameraService, threeSceneService, $rootScope)
	}

	//noinspection TypeScriptUnresolvedVariable
	it(
		"should retrieve the angular service instance",
		NG.mock.inject(threeOrbitControlsService => {
			expect(threeOrbitControlsService).not.toBe(undefined)
		})
	)

	it("rotateCameraInVectorDirection ", () => {
		threeOrbitControlsService.controls = {
			target: new THREE.Vector3(0, 0, 0)
		} as OrbitControls
		const vector = { x: 0, y: 1, z: 0 }

		threeOrbitControlsService.rotateCameraInVectorDirection(vector.x, vector.y, vector.z)

		expect(threeCameraService.camera.position.distanceTo).toBeCalledWith(threeOrbitControlsService.controls.target)
		expect(threeCameraService.camera.position.set).toBeCalledWith(
			threeOrbitControlsService.controls.target.x,
			threeOrbitControlsService.controls.target.y,
			threeOrbitControlsService.controls.target.z
		)
		expect(threeSceneService.scene.add).toBeCalled()
		expect(threeSceneService.scene.remove).toBeCalled()
		expect(threeCameraService.camera.lookAt).toBeCalledWith(vector)
		expect(threeCameraService.camera.translateZ).toBeCalledWith(1)
	})

	it("autoFitTo ", () => {
		threeOrbitControlsService.controls = {
			target: new THREE.Vector3(1, 1, 1)
		} as OrbitControls
		threeOrbitControlsService.controls.update = jest.fn()

		threeOrbitControlsService.autoFitTo(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10)))

		expect(threeCameraService.camera.position.set).toBeCalledWith(vector.x, vector.y, vector.z)
		expect(threeOrbitControlsService.controls.update).toBeCalled()
		expect(threeCameraService.camera.lookAt).toBeCalledWith(new THREE.Vector3(0, 0, 0))
		expect(threeCameraService.camera.updateProjectionMatrix).toBeCalled()
		expect(threeOrbitControlsService.defaultCameraPosition.x).toEqual(vector.x)
		expect(threeOrbitControlsService.defaultCameraPosition.y).toEqual(vector.y)
		expect(threeOrbitControlsService.defaultCameraPosition.z).toEqual(vector.z)
	})
})
