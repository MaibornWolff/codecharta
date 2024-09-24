import { TestBed } from "@angular/core/testing"
import { Scene, Vector2, WebGLRenderer, WebGLInfo, WebGLRenderTarget, Texture, Camera } from "three"
import { Store, StoreModule } from "@ngrx/store"
import WEBGL from "three/examples/jsm/capabilities/WebGL"
import { SharpnessMode } from "../../../codeCharta.model"
import { setSharpnessMode } from "../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { ThreeRendererService } from "./threeRenderer.service"
import * as composer from "../rendering/postprocessor/customComposer"
import { setIsWhiteBackground } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

jest.mock("three", () => {
    const originalThree = jest.requireActual("three")
    return {
        ...originalThree,
        WebGLRenderer: jest.fn(() => ({
            domElement: {
                addEventListener: jest.fn(),
                getBoundingClientRect: jest.fn(() => ({ left: 20, top: 20 })),
                width: 100,
                height: 100
            },
            getPixelRatio: jest.fn(() => 2),
            setPixelRatio: jest.fn(),
            setSize: jest.fn(),
            render: jest.fn(),
            getDrawingBufferSize: jest.fn(() => new Vector2(1, 1)),
            info: {
                render: { triangles: 1 } as WebGLInfo["render"],
                memory: { geom: 1 } as unknown as WebGLInfo["memory"]
            }
        }))
    }
})

jest.mock("../rendering/postprocessor/customComposer", () => ({
    CustomComposer: jest.fn().mockImplementation(() => ({
        setSize: jest.fn(),
        addPass: jest.fn(),
        render: jest.fn(),
        getInfo: jest.fn().mockReturnValue({ triangles: 0 }),
        getMemoryInfo: jest.fn().mockReturnValue({ geom: 0 })
    }))
}))

describe("threeRendererService", () => {
    let threeRendererService: ThreeRendererService
    let store: Store

    const setFXAA = (value: boolean) => {
        ThreeRendererService.enableFXAA = value
        store.dispatch(setSharpnessMode({ value: value ? SharpnessMode.PixelRatioFXAA : SharpnessMode.Standard }))
    }

    const setPixelRatio = (value: boolean) => {
        ThreeRendererService.setPixelRatio = value
        store.dispatch(setSharpnessMode({ value: value ? SharpnessMode.PixelRatioFXAA : SharpnessMode.Standard }))
    }

    const setWebGl2 = (value: boolean) => {
        jest.spyOn(WEBGL, "isWebGL2Available").mockReturnValue(value)
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [ThreeRendererService]
        })
        store = TestBed.inject(Store)

        threeRendererService = TestBed.inject(ThreeRendererService)
        threeRendererService.composer = new CustomComposer(
            new WebGLRenderer(),
            new WebGLRenderTarget<Texture>()
        ) as unknown as CustomComposer
        threeRendererService.renderer = new WebGLRenderer() as unknown as WebGLRenderer
        threeRendererService["setBackgroundColorToState"] = jest.fn()
    })

    describe("init", () => {
        it("should call initGL", () => {
            jest.spyOn(threeRendererService as any, "initGL").mockImplementation()
            threeRendererService.init(10, 20, new Scene(), new Camera())
            expect(threeRendererService["initGL"]).toHaveBeenCalledWith(10, 20)
        })

        it("should ignore background updates before it was initialized", () => {
            store.dispatch(setIsWhiteBackground({ value: true }))
            expect(threeRendererService["setBackgroundColorToState"]).not.toHaveBeenCalled()
        })

        it("should set its background color within init and subscribe to updates", () => {
            threeRendererService.init(10, 20, new Scene(), new Camera())
            expect(threeRendererService["setBackgroundColorToState"]).toHaveBeenCalledTimes(1)
            store.dispatch(setIsWhiteBackground({ value: true }))
            expect(threeRendererService["setBackgroundColorToState"]).toHaveBeenCalledTimes(2)
        })
    })

    describe("initGL", () => {
        it("should call setGLOptions", () => {
            jest.spyOn(threeRendererService as any, "setGLOptions").mockImplementation()
            threeRendererService["initGL"](10, 20)
            expect(threeRendererService["setGLOptions"]).toHaveBeenCalled()
        })

        it("should call getDrawingBufferSize when webgl2 is available and FXAA is true", () => {
            setFXAA(true)
            setWebGl2(true)

            threeRendererService["initGL"](1, 1)
            expect(threeRendererService.renderer.getDrawingBufferSize).toHaveBeenCalledWith(expect.any(Vector2))
        })

        it("should generate custom composer with render target when webgl2 is available and FXAA is true", () => {
            setFXAA(true)
            setWebGl2(true)

            const customComposer = jest.spyOn(composer, "CustomComposer")
            threeRendererService["initGL"](1, 1)
            expect(customComposer).toHaveBeenCalled()
        })

        it("should generate custom composer with no render target when webgl2 is not available and FXAA is true", () => {
            setFXAA(true)
            setWebGl2(false)

            const customComposer = jest.spyOn(composer, "CustomComposer")
            threeRendererService["initGL"](1, 1)
            expect(customComposer).toHaveBeenCalled()
        })

        it("should call renderer setPixelRatio when pixelRatio is true", () => {
            setPixelRatio(true)
            threeRendererService["initGL"](1, 1)
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalled()
        })

        it("should not call renderer setPixelRatio when pixelRatio is false", () => {
            setPixelRatio(false)
            threeRendererService["initGL"](1, 1)
            expect(threeRendererService.renderer.setPixelRatio).not.toHaveBeenCalled()
        })

        it("should call renderer setSize", () => {
            threeRendererService["initGL"](1, 2)
            expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(1, 2)
        })

        it("should call initComposer when enableFXAA is true", () => {
            jest.spyOn(threeRendererService as any, "initComposer").mockImplementation()
            store.dispatch(setSharpnessMode({ value: SharpnessMode.PixelRatioFXAA }))

            threeRendererService["initGL"](1, 1)
            expect(threeRendererService["initComposer"]).toHaveBeenCalled()
        })

        it("should not call initComposer when enableFXAA is false", () => {
            jest.spyOn(threeRendererService as any, "initComposer").mockImplementation()
            store.dispatch(setSharpnessMode({ value: SharpnessMode.Standard }))

            threeRendererService["initGL"](1, 1)
            expect(threeRendererService["initComposer"]).not.toHaveBeenCalled()
        })
    })

    describe("setGLOptions", () => {
        it("should call and set the standard options", () => {
            store.dispatch(setSharpnessMode({ value: SharpnessMode.Standard }))

            threeRendererService["setGLOptions"]()

            expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(true)
            expect(ThreeRendererService.enableFXAA).toBe(false)
            expect(ThreeRendererService.setPixelRatio).toBe(false)
        })

        it("should call and set the pixel ratio with no AA options", () => {
            store.dispatch(setSharpnessMode({ value: SharpnessMode.PixelRatioNoAA }))

            threeRendererService["setGLOptions"]()

            expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(false)
            expect(ThreeRendererService.enableFXAA).toBe(false)
            expect(ThreeRendererService.setPixelRatio).toBe(true)
        })

        it("should call and set the pixel ratio with FXAA options", () => {
            store.dispatch(setSharpnessMode({ value: SharpnessMode.PixelRatioFXAA }))

            threeRendererService["setGLOptions"]()

            expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(false)
            expect(ThreeRendererService.enableFXAA).toBe(true)
            expect(ThreeRendererService.setPixelRatio).toBe(true)
        })

        it("should call and set the pixel ratio with AA options", () => {
            store.dispatch(setSharpnessMode({ value: SharpnessMode.PixelRatioAA }))

            threeRendererService["setGLOptions"]()

            expect(ThreeRendererService.RENDER_OPTIONS.antialias).toBe(true)
            expect(ThreeRendererService.enableFXAA).toBe(false)
            expect(ThreeRendererService.setPixelRatio).toBe(true)
        })
    })

    describe("initComposer", () => {
        it("should call renderer getPixelRatio", () => {
            threeRendererService["initComposer"]()

            expect(threeRendererService.renderer.getPixelRatio).toHaveBeenCalled()
        })

        it("should call composer setSize", () => {
            threeRendererService["initComposer"]()

            expect(threeRendererService.composer.setSize).toHaveBeenCalled()
        })

        it("should call composer addPass", () => {
            threeRendererService["initComposer"]()

            expect(threeRendererService.composer.addPass).toHaveBeenCalled()
        })
    })

    describe("getInfo", () => {
        it("should call composer getInfo when FXAA enabled", () => {
            setFXAA(true)

            const info = threeRendererService.getInfo()
            expect(threeRendererService.composer.getInfo).toHaveBeenCalled()
            expect(info).toStrictEqual({ triangles: 0 })
        })

        it("should return renderer.info when FXAA disabled", () => {
            setFXAA(false)

            const info = threeRendererService.getInfo()
            expect(info).toStrictEqual({ triangles: 1 })
        })
    })

    describe("getMemoryInfo", () => {
        it("should call composer getMemoryInfo when FXAA enabled", () => {
            setFXAA(true)

            const info = threeRendererService.getMemoryInfo()
            expect(threeRendererService.composer.getMemoryInfo).toHaveBeenCalled()
            expect(info).toStrictEqual({ geom: 0 })
        })

        it("should return renderer.info when FXAA disabled", () => {
            setFXAA(false)

            const info = threeRendererService.getMemoryInfo()
            expect(info).toStrictEqual({ geom: 1 })
        })
    })

    describe("render", () => {
        it("should not call renderer render when renderer is undefined and FXAA is disabled", () => {
            setFXAA(false)
            const render = jest.spyOn(threeRendererService.renderer, "render")
            threeRendererService.renderer = undefined

            threeRendererService.render()
            expect(render).not.toHaveBeenCalled()
        })

        it("should not call composer render when composer is undefined and FXAA is enabled", () => {
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

            threeRendererService.render()
            expect(threeRendererService.renderer.render).toHaveBeenCalledWith(threeRendererService.scene, threeRendererService.camera)
        })
    })
})
