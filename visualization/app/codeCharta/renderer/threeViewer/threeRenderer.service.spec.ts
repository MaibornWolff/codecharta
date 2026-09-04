import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { Camera, Scene, Vector2, WebGLInfo, WebGLRenderer } from "three"
import { setIsWhiteBackground } from "../../stores/mapState/mapState.write.facade"
import { appReducers, setStateMiddleware } from "../../stores/rootStore/store"
import { ThreeRendererService } from "./threeRenderer.service"

jest.mock("three", () => {
    const originalThree = jest.requireActual("three")
    return {
        ...originalThree,
        WebGLRenderer: jest.fn(() => ({
            domElement: {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
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

describe("threeRendererService", () => {
    let threeRendererService: ThreeRendererService
    let store: Store

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [ThreeRendererService]
        })
        store = TestBed.inject(Store)

        threeRendererService = TestBed.inject(ThreeRendererService)
        threeRendererService.renderer = new WebGLRenderer() as unknown as WebGLRenderer
        threeRendererService["setBackgroundColorToState"] = jest.fn()
    })

    describe("init", () => {
        it("should call initGL", () => {
            // Arrange
            jest.spyOn(threeRendererService as any, "initGL").mockImplementation()

            // Act
            threeRendererService.init(10, 20, new Scene(), new Camera())

            // Assert
            expect(threeRendererService["initGL"]).toHaveBeenCalledWith(10, 20)
        })

        it("should ignore background updates before it was initialized", () => {
            // Arrange & Act
            store.dispatch(setIsWhiteBackground({ value: true }))

            // Assert
            expect(threeRendererService["setBackgroundColorToState"]).not.toHaveBeenCalled()
        })

        it("should set its background color within init and subscribe to updates", () => {
            // Arrange & Act
            threeRendererService.init(10, 20, new Scene(), new Camera())

            // Assert
            expect(threeRendererService["setBackgroundColorToState"]).toHaveBeenCalledTimes(1)

            // Act
            store.dispatch(setIsWhiteBackground({ value: true }))

            // Assert
            expect(threeRendererService["setBackgroundColorToState"]).toHaveBeenCalledTimes(2)
        })
    })

    describe("initGL", () => {
        it("should use antialiasing", () => {
            // Arrange & Act
            threeRendererService["initGL"](1, 1)

            // Assert
            expect(threeRendererService.renderOptions.antialias).toBe(true)
        })

        it("should call renderer setSize", () => {
            // Arrange & Act
            threeRendererService["initGL"](1, 2)

            // Assert
            expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(1, 2)
        })
    })

    describe("pixel ratio budget", () => {
        function withDevicePixelRatio(value: number) {
            Object.defineProperty(window, "devicePixelRatio", { value, configurable: true })
        }

        const originalDevicePixelRatio = window.devicePixelRatio

        afterEach(() => {
            withDevicePixelRatio(originalDevicePixelRatio)
        })

        it("should use the device pixel ratio when it stays within both budgets", () => {
            // Arrange
            withDevicePixelRatio(2)

            // Act
            threeRendererService["initGL"](800, 600)

            // Assert
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalledWith(2)
        })

        it("should cap the ratio of a high density screen", () => {
            // Arrange
            withDevicePixelRatio(3)

            // Act
            threeRendererService["initGL"](800, 600)

            // Assert
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalledWith(ThreeRendererService.MAX_PIXEL_RATIO)
        })

        it("should shrink the ratio further so a large viewport stays within the buffer budget", () => {
            // Arrange — a phone's 980x1669 layout viewport at ratio 3 would be 14.7 megapixels
            withDevicePixelRatio(3)

            // Act
            threeRendererService["initGL"](980, 1669)

            // Assert
            const ratio = (threeRendererService.renderer.setPixelRatio as jest.Mock).mock.calls[0][0]
            expect(980 * ratio * (1669 * ratio)).toBeLessThanOrEqual(ThreeRendererService.MAX_DRAWING_BUFFER_PIXELS)
            expect(ratio).toBeLessThan(ThreeRendererService.MAX_PIXEL_RATIO)
        })

        it("should never drop below a ratio of one, so a huge viewport stays sharp as it can be", () => {
            // Arrange
            withDevicePixelRatio(3)

            // Act
            threeRendererService["initGL"](8000, 8000)

            // Assert
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalledWith(1)
        })

        it("should re-apply the budget on resize, because a rotation changes the viewport", () => {
            // Arrange
            withDevicePixelRatio(3)
            threeRendererService["initGL"](980, 1669)
            ;(threeRendererService.renderer.setPixelRatio as jest.Mock).mockClear()
            const setLabelSize = jest.spyOn(threeRendererService.labelRenderer, "setSize")

            // Act
            threeRendererService.setSize(800, 600)

            // Assert
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalledWith(ThreeRendererService.MAX_PIXEL_RATIO)
            expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(800, 600)
            expect(setLabelSize).toHaveBeenCalledWith(800, 600)
        })
    })

    describe("context loss", () => {
        beforeEach(() => {
            // A restore re-renders, so the scene it renders has to exist before one is triggered.
            threeRendererService.scene = new Scene()
            threeRendererService.camera = new Camera()
        })

        function initAndCaptureHandler(eventName: string) {
            threeRendererService["initGL"](1, 1)
            const listen = threeRendererService.renderer.domElement.addEventListener as unknown as jest.Mock
            return listen.mock.calls.find(([name]) => name === eventName)[1] as (event: Event) => void
        }

        it("should report an intact context before anything is lost", async () => {
            // Arrange & Act
            threeRendererService["initGL"](1, 1)

            // Assert
            expect(await firstValueFrom(threeRendererService.isContextLost$)).toBe(false)
        })

        it("should report a lost context", async () => {
            // Arrange
            const onContextLost = initAndCaptureHandler("webglcontextlost")

            // Act
            onContextLost(new Event("webglcontextlost"))

            // Assert
            expect(await firstValueFrom(threeRendererService.isContextLost$)).toBe(true)
        })

        it("should prevent the default, because only then does the browser try to restore the context", () => {
            // Arrange
            const onContextLost = initAndCaptureHandler("webglcontextlost")
            const event = new Event("webglcontextlost", { cancelable: true })

            // Act
            onContextLost(event)

            // Assert
            expect(event.defaultPrevented).toBe(true)
        })

        it("should report an intact context again once it is restored", async () => {
            // Arrange
            threeRendererService["initGL"](1, 1)
            const listen = threeRendererService.renderer.domElement.addEventListener as unknown as jest.Mock
            const handlerFor = (name: string) => listen.mock.calls.find(([eventName]) => eventName === name)[1]
            handlerFor("webglcontextlost")(new Event("webglcontextlost"))

            // Act
            handlerFor("webglcontextrestored")(new Event("webglcontextrestored"))

            // Assert
            expect(await firstValueFrom(threeRendererService.isContextLost$)).toBe(false)
        })

        it("should detach its listeners on destroy", () => {
            // Arrange
            threeRendererService["initGL"](1, 1)
            const { domElement } = threeRendererService.renderer

            // Act
            threeRendererService.destroy()

            // Assert
            expect(domElement.removeEventListener).toHaveBeenCalledWith("webglcontextlost", expect.any(Function))
            expect(domElement.removeEventListener).toHaveBeenCalledWith("webglcontextrestored", expect.any(Function))
        })
    })

    describe("getInfo", () => {
        it("should return renderer render info", () => {
            // Arrange & Act
            const info = threeRendererService.getInfo()

            // Assert
            expect(info).toStrictEqual({ triangles: 1 })
        })
    })

    describe("getMemoryInfo", () => {
        it("should return renderer memory info", () => {
            // Arrange & Act
            const info = threeRendererService.getMemoryInfo()

            // Assert
            expect(info).toStrictEqual({ geom: 1 })
        })
    })

    describe("render", () => {
        it("should not call renderer render when renderer is undefined", () => {
            // Arrange
            const render = jest.spyOn(threeRendererService.renderer, "render")
            threeRendererService.renderer = undefined

            // Act
            threeRendererService.render()

            // Assert
            expect(render).not.toHaveBeenCalled()
        })

        it("should call renderer render", done => {
            // Arrange & Act
            threeRendererService.render()

            // Assert
            requestAnimationFrame(() => {
                expect(threeRendererService.renderer.render).toHaveBeenCalledWith(threeRendererService.scene, threeRendererService.camera)
                done()
            })
        })
    })
})
