import "./threeViewer.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { IsWhiteBackgroundService } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeCameraService } from "./threeCameraService"
import { Camera, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { setIsWhiteBackground } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setSharpnessMode } from "../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { SharpnessMode } from "../../../codeCharta.model"
// eslint-disable-next-line no-duplicate-imports
import * as three from "three"
import { WEBGL } from "three/examples/jsm/WebGL"
// eslint-disable-next-line no-duplicate-imports
import * as composer from "../rendering/postprocessor/customComposer"

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

	const mockedWebGLRenderer = () => {
		const eventMap = {}
		const webGLRenderer = new WebGLRenderer({
			context: {
				getParameter: jest.fn().mockReturnValue(["WebGL 2"]),
				getExtension: jest.fn().mockReturnValue({
					EXT_blend_minmax: null
				}),
				createTexture: jest.fn(),
				bindTexture: jest.fn(),
				texParameteri: jest.fn(),
				texImage2D: jest.fn(),
				clearColor: jest.fn(),
				clearDepth: jest.fn(),
				clearStencil: jest.fn(),
				enable: jest.fn(),
				disable: jest.fn(),
				depthFunc: jest.fn(),
				frontFace: jest.fn(),
				cullFace: jest.fn(),
				initGLContext: jest.fn(),
				scissor: jest.fn(),
				viewport: jest.fn()
			} as unknown as WebGLRenderingContext
		})

		webGLRenderer.domElement = {
			addEventListener: jest.fn((event, callback) => {
				eventMap[event] = callback
			}),
			getBoundingClientRect: jest.fn().mockReturnValue({ left: 20, top: 20 }),
			width: 100,
			height: 100
		} as unknown as HTMLCanvasElement

		webGLRenderer.getPixelRatio = jest.fn().mockReturnValue(2)
		webGLRenderer.setClearColor = jest.fn()
		webGLRenderer.render = jest.fn()
		webGLRenderer.setPixelRatio = jest.fn()
		webGLRenderer.getDrawingBufferSize = jest.fn().mockReturnValue({
			size: {
				width: 1,
				height: 1
			}
		})
		webGLRenderer.setSize = jest.fn()

		return webGLRenderer
	}

	const mockThreeJs = () => {
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeCameraService.camera = new PerspectiveCamera()
		threeSceneService.scene = { position: new Vector3(1, 2, 3) } as Scene
		threeRendererService.composer = {
			render: jest.fn(),
			setSize: jest.fn(),
			addPass: jest.fn(),
			getInfo: jest.fn().mockReturnValue({
				triangles: 0
			}),
			getMemoryInfo: jest.fn().mockReturnValue({
				geom: 0
			})
		} as unknown as CustomComposer
		threeRendererService.renderer = {
			...mockedWebGLRenderer(),
			info: {
				render: { triangles: 1 },
				memory: { geom: 1 }
			}
		} as unknown as WebGLRenderer
		threeRendererService["initGL"] = jest.fn()
		threeRendererService["onIsWhiteBackgroundChanged"] = jest.fn()
		threeRendererService["setGLOptions"] = jest.fn()
	}

	const setFXAA = (value: boolean) => {
		ThreeRendererService.enableFXAA = value
		storeService.dispatch(setSharpnessMode(value ? SharpnessMode.PixelRatioFXAA : SharpnessMode.Standard))
	}

	const setPixelRatio = (value: boolean) => {
		ThreeRendererService.setPixelRatio = value
		storeService.dispatch(setSharpnessMode(value ? SharpnessMode.PixelRatioFXAA : SharpnessMode.Standard))
	}

	const setWebGl2 = value => {
		jest.spyOn(WEBGL, "isWebGL2Available").mockImplementationOnce(() => {
			return value
		})
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
			mockThreeJs()
		})
		it("should call initGL", () => {
			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["initGL"]).toHaveBeenCalledWith(10, 20)
		})

		it("should call onIsWhiteBackgroundChanged with true when option is set", () => {
			storeService.dispatch(setIsWhiteBackground(true))

			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["onIsWhiteBackgroundChanged"]).toBeCalledWith(true)
		})

		it("should call onIsWhiteBackgroundChanged with false when option is set", () => {
			storeService.dispatch(setIsWhiteBackground(false))

			threeRendererService.init(10, 20, new Scene(), new Camera())

			expect(threeRendererService["onIsWhiteBackgroundChanged"]).toBeCalledWith(false)
		})
	})

	describe("initGL", () => {
		beforeEach(() => {
			rebuildService()

			jest.spyOn(three, "WebGLRenderer").mockImplementationOnce(() => {
				return mockedWebGLRenderer()
			})
		})

		it("should call setGLOptions", () => {
			threeRendererService["setGLOptions"] = jest.fn()

			threeRendererService["initGL"](1, 1)

			expect(threeRendererService["setGLOptions"]).toHaveBeenCalled()
		})

		it("should call getDrawingBufferSize when webgl2 is available and FXAA is true", () => {
			setFXAA(true)
			setWebGl2(true)

			threeRendererService["initGL"](1, 1)

			expect(threeRendererService.renderer["getDrawingBufferSize"]).toHaveBeenCalledWith(expect.any(Vector2))
		})

		const spyOnComposer = () => {
			return jest.spyOn(composer, "CustomComposer").mockReturnValue({
				setSize: jest.fn(),
				addPass: jest.fn()
			} as unknown as CustomComposer)
		}

		it("should generate customcomposer with render target  when webgl2 is available and FXAA is true", () => {
			setFXAA(true)
			setWebGl2(true)

			const customComposer = spyOnComposer()

			threeRendererService["initGL"](1, 1)

			expect(customComposer).toHaveBeenCalledWith(expect.any(WebGLRenderer), expect.any(WebGLRenderTarget))
		})

		it("should generate customcomposer with no render target when webgl2 is not available and FXAA is true", () => {
			setFXAA(true)
			setWebGl2(false)
			rebuildService()

			const customComposer = spyOnComposer()

			threeRendererService["initGL"](1, 1)

			expect(customComposer).toHaveBeenCalledWith(expect.any(WebGLRenderer), expect.any(WebGLRenderTarget))
		})

		it("should call renderer setPixelRatio when pixelRatio is true", () => {
			setPixelRatio(true)
			threeRendererService["initGL"](1, 1)

			expect(threeRendererService.renderer["setPixelRatio"]).toHaveBeenCalled()
		})

		it("should not call renderer setPixelRatio when pixelRatio is true", () => {
			setPixelRatio(false)
			threeRendererService["initGL"](1, 1)

			expect(threeRendererService.renderer["setPixelRatio"]).not.toHaveBeenCalled()
		})

		it("should call renderer setSize", () => {
			threeRendererService["initGL"](1, 2)

			expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(1, 2)
		})

		it("should call initComposer when enableFXAA is true", () => {
			threeRendererService["initComposer"] = jest.fn()
			storeService.dispatch(setSharpnessMode(SharpnessMode.PixelRatioFXAA))

			threeRendererService["initGL"](1, 1)

			expect(threeRendererService["initComposer"]).toHaveBeenCalled()
		})

		it("should not call initComposer when enableFXAA is false", () => {
			threeRendererService["initComposer"] = jest.fn()
			storeService.dispatch(setSharpnessMode(SharpnessMode.Standard))

			threeRendererService["initGL"](1, 1)

			expect(threeRendererService["initComposer"]).not.toHaveBeenCalled()
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
			setFXAA(true)

			const info = threeRendererService.getInfo()

			expect(threeRendererService.composer.getInfo).toBeCalled()
			expect(info).toStrictEqual({ triangles: 0 })
		})

		it("should return renderer.info when FXAA disabled", () => {
			setFXAA(false)

			const info = threeRendererService.getInfo()

			expect(info).toStrictEqual({ triangles: 1 })
		})
	})

	describe("getMemoryInfo", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should call composer getMemoryInfo when FXAA enabled", () => {
			setFXAA(true)

			const info = threeRendererService.getMemoryInfo()

			expect(threeRendererService.composer.getMemoryInfo).toBeCalled()
			expect(info).toStrictEqual({ geom: 0 })
		})

		it("should return renderer.info when FXAA disabled", () => {
			setFXAA(false)

			const info = threeRendererService.getMemoryInfo()

			expect(info).toStrictEqual({ geom: 1 })
		})
	})

	describe("onIsWhiteBackgroundChanged", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should not setClearColor when renderer is undefined", () => {
			const setClearColor = jest.spyOn(threeRendererService.renderer, "setClearColor")
			threeRendererService.renderer = undefined

			threeRendererService.onIsWhiteBackgroundChanged(true)

			expect(setClearColor).not.toHaveBeenCalled()
		})
	})

	describe("render", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should not call renderer render when renderer is undefined and FXAA is disabled", () => {
			setFXAA(false)
			const render = jest.spyOn(threeRendererService.renderer, "render")
			threeRendererService.renderer = undefined

			threeRendererService.render()

			expect(render).not.toHaveBeenCalled()
		})

		it("should not call composer render when renderer is undefined and FXAA is disabled", () => {
			setFXAA(true)
			const render = jest.spyOn(threeRendererService.composer, "render")
			threeRendererService.composer = undefined

			threeRendererService.render()

			expect(render).not.toHaveBeenCalled()
		})

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
