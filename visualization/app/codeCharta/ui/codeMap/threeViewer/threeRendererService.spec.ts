import "./threeViewer.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { IsWhiteBackgroundService } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeCameraService } from "./threeCameraService"
import { Camera, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { setIsWhiteBackground } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setSharpnessMode } from "../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { SharpnessMode } from "../../../codeCharta.model"

describe("ThreeRenderService", () => {
	let threeRendererService: ThreeRendererService
	let storeService: StoreService
	let $rootScope: IRootScopeService
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	const restartSystem = () => {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
	}

	const rebuildService = () => {
		threeRendererService = new ThreeRendererService(storeService, $rootScope)
	}

	const mockThreeJs = () => {
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeCameraService.camera = new PerspectiveCamera()
		threeSceneService.scene = { position: new Vector3(1, 2, 3) } as Scene
		threeRendererService.composer = ({
			render: jest.fn(),
			setSize: jest.fn(),
			addPass: jest.fn(),
			getInfo: jest.fn().mockReturnValue({
				triangles: 0
			}),
			getMemoryInfo: jest.fn().mockReturnValue({
				geom: 0
			})
		} as unknown) as CustomComposer
		threeRendererService.renderer = ({
			render: jest.fn(),
			getPixelRatio: jest.fn(),
			info: {
				render: { triangles: 1 },
				memory: { geom: 1 }
			}
		} as unknown) as WebGLRenderer
		threeRendererService["initGL"] = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to IsWhiteBackgroundService", () => {
			IsWhiteBackgroundService.subscribe = jest.fn()

			rebuildService()

			expect(IsWhiteBackgroundService.subscribe).toHaveBeenCalledWith($rootScope, threeRendererService)
		})
	})

	describe("init", () => {
		beforeEach(() => {
			rebuildService()
			threeRendererService["initGL"] = jest.fn()
		})
		it("should call initGL", () => {
			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["initGL"]).toHaveBeenCalledWith(10, 20)
		})

		it("should call onIsWhiteBackgroundChanged with true when option is set", () => {
			threeRendererService["onIsWhiteBackgroundChanged"] = jest.fn()
			storeService.dispatch(setIsWhiteBackground(true))

			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["onIsWhiteBackgroundChanged"]).toBeCalledWith(true)
		})

		it("should call onIsWhiteBackgroundChanged with false when option is set", () => {
			threeRendererService["onIsWhiteBackgroundChanged"] = jest.fn()
			storeService.dispatch(setIsWhiteBackground(false))

			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["onIsWhiteBackgroundChanged"]).toBeCalledWith(false)
		})
	})

	describe("setGLOptions", () => {
		it("should call and set the standard options", () => {
			storeService.dispatch(setSharpnessMode(SharpnessMode.Standard))

			threeRendererService["setGLOptions"]()

			expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(true)
			expect(ThreeRendererService.enableFXAA).toBe(false)
			expect(ThreeRendererService.setPixelRatio).toBe(false)
		})

		it("should call and set the pixel ration with no AA options", () => {
			storeService.dispatch(setSharpnessMode(SharpnessMode.PixelRatioNoAA))

			threeRendererService["setGLOptions"]()

			expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(false)
			expect(ThreeRendererService.enableFXAA).toBe(false)
			expect(ThreeRendererService.setPixelRatio).toBe(true)
		})

		it("should call and set the pixel ration with FXAA options", () => {
			storeService.dispatch(setSharpnessMode(SharpnessMode.PixelRatioFXAA))

			threeRendererService["setGLOptions"]()

			expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(false)
			expect(ThreeRendererService.enableFXAA).toBe(true)
			expect(ThreeRendererService.setPixelRatio).toBe(true)
		})

		it("should call and set the pixel ration with AA options", () => {
			storeService.dispatch(setSharpnessMode(SharpnessMode.PixelRatioAA))

			threeRendererService["setGLOptions"]()

			expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(true)
			expect(ThreeRendererService.enableFXAA).toBe(false)
			expect(ThreeRendererService.setPixelRatio).toBe(true)
		})
	})

	describe("initComposer", () => {
		beforeEach(() => {
			rebuildService()
			mockThreeJs()
		})
		it("should call renderer getPixelRatio", () => {
			threeRendererService["initComposer"]()

			expect(threeRendererService.renderer.getPixelRatio).toBeCalled()
		})

		it("should call composer setSize", () => {
			threeRendererService["initComposer"]()

			expect(threeRendererService.composer.setSize).toBeCalled()
		})

		it("should call composer addPass", () => {
			threeRendererService["initComposer"]()

			expect(threeRendererService.composer.addPass).toBeCalled()
		})
	})

	describe("getInfo", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should call composer getInfo when FXAA enabled", () => {
			ThreeRendererService.enableFXAA = true

			const info = threeRendererService.getInfo()

			expect(threeRendererService.composer.getInfo).toBeCalled()
			expect(info).toStrictEqual({ triangles: 0 })
		})

		it("should return renderer.info when FXAA disabled", () => {
			ThreeRendererService.enableFXAA = false

			const info = threeRendererService.getInfo()

			expect(info).toStrictEqual({ triangles: 1 })
		})
	})

	describe("getMemoryInfo", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should call composer getMemoryInfo when FXAA enabled", () => {
			ThreeRendererService.enableFXAA = true

			const info = threeRendererService.getMemoryInfo()

			expect(threeRendererService.composer.getMemoryInfo).toBeCalled()
			expect(info).toStrictEqual({ geom: 0 })
		})

		it("should return renderer.info when FXAA disabled", () => {
			ThreeRendererService.enableFXAA = false

			const info = threeRendererService.getMemoryInfo()

			expect(info).toStrictEqual({ geom: 1 })
		})
	})

	describe("render", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		const setFXAA = (value: boolean) => {
			ThreeRendererService.enableFXAA = value
		}

		it("should call composer when FXAA is enabled", () => {
			setFXAA(true)
			threeRendererService.render()

			expect(threeRendererService.composer.render).toHaveBeenCalled()
		})

		it("should call normal renderer when FXAA is disabled", () => {
			setFXAA(false)
			threeRendererService.scene = threeSceneService.scene
			threeRendererService.camera = threeCameraService.camera
			const { scene, camera, renderer } = threeRendererService

			threeRendererService.render()

			expect(renderer.render).toHaveBeenCalledWith(scene, camera)
		})
	})
})
