import "./threeViewer.module"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService } from "angular"
import * as THREE from "three"
import { OrbitControls, PerspectiveCamera, Vector3 } from "three"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { LoadingGifService } from "../../loadingGif/loadingGif.service"

describe("ThreeOrbitControlsService", () => {
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let settingsService: SettingsService
	let loadingGifService: LoadingGifService

	let vector: Vector3

	afterEach(() => {
		jest.resetAllMocks()
	})

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedControlService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		loadingGifService = getService<LoadingGifService>("loadingGifService")

		vector = new Vector3(4.4577067775672665, 4.4577067775672665, 4.4577067775672665)
	}

	function withMockedThreeCameraService() {
		const camera = new PerspectiveCamera(100, 0, 0, 0)
		camera.position.set(vector.x, vector.y, vector.z)
		threeCameraService = threeOrbitControlsService["threeCameraService"] = jest.fn<ThreeCameraService>(() => {
			return {
				camera
			}
		})()
	}

	function withMockedThreeSceneService() {
		threeSceneService = threeOrbitControlsService["threeSceneService"] = jest.fn<ThreeSceneService>(() => {
			return {
				scene: {
					add: jest.fn(),
					remove: jest.fn()
				},
				mapGeometry: new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10))
			}
		})()
	}

	function withMockedControlService(){
		threeOrbitControlsService.controls = {
			target: new THREE.Vector3(1, 1, 1)
		} as OrbitControls
		threeOrbitControlsService.controls.update = jest.fn()
	}

	function rebuildService() {
		threeOrbitControlsService = new ThreeOrbitControlsService(
			threeCameraService,
			threeSceneService,
			$rootScope,
			settingsService,
			loadingGifService
		)
	}

	describe("constructor", () => {
		it("should subscribe to FocusedNodePath-Event", () => {
			SettingsService.subscribeToFocusNode = jest.fn()

			rebuildService()

			expect(SettingsService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, threeOrbitControlsService)
		})
	})

	it("rotateCameraInVectorDirection ", () => {
		threeOrbitControlsService.controls = {
			target: new THREE.Vector3(0, 0, 0)
		} as OrbitControls
		const vector = { x: 0, y: 1, z: 0 }

		threeOrbitControlsService.rotateCameraInVectorDirection(vector.x, vector.y, vector.z)

		expect(threeSceneService.scene.add).toBeCalled()
		expect(threeSceneService.scene.remove).toBeCalled()

		expect(threeCameraService.camera.position).toMatchSnapshot()
	})

	describe("onFocusedNode", () => {

		it("autoFitTo have to be ", () => {

			threeOrbitControlsService.onFocusNode("something")

			expect(threeOrbitControlsService.controls.update).toBeCalled()

		})
	})


	describe("onUnfocusNode", () => {
		beforeEach(() => {
			threeOrbitControlsService["resetCameraPerspective"] = jest.fn()
		})

		it("should call resetCamera, when map is not loading ", () => {
			loadingGifService["isLoadingFile"] = false
			loadingGifService["isLoadingMap"] = false

			threeOrbitControlsService.onUnfocusNode()

			expect(threeOrbitControlsService["resetCameraPerspective"]).toBeCalled()

		})


		it("should not call resetCamera, when map is loading ", () => {
			loadingGifService["isLoadingFile"] = true
			loadingGifService["isLoadingMap"] = false

			threeOrbitControlsService.onUnfocusNode()

			expect(threeOrbitControlsService["resetCameraPerspective"]).not.toHaveBeenCalled()

		})

	})

	describe("autoFitTo", ()=>{

		it("should auto fit map to its origin value ", ()=>{

			threeCameraService.camera.position.set(0,0,0)

			threeOrbitControlsService.autoFitTo()

			expect(threeCameraService.camera.position).toEqual(vector)

		})

		it("should call an control update", () =>{
			 threeCameraService.camera.lookAt = jest.fn()


			threeOrbitControlsService.autoFitTo()


			expect(threeCameraService.camera.lookAt).toBeCalledWith(threeOrbitControlsService.controls.target)
		})

	})

})
