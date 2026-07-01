import { TestBed } from "@angular/core/testing"
import { Scene, Vector2, WebGLRenderer, WebGLInfo, Camera } from "three"
import { Store, StoreModule } from "@ngrx/store"
import { ThreeRendererService } from "./threeRenderer.service"
import { setIsWhiteBackground } from "../../../appearance/appearance.facade"
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

        it("should call renderer setPixelRatio", () => {
            // Arrange & Act
            threeRendererService["initGL"](1, 1)

            // Assert
            expect(threeRendererService.renderer.setPixelRatio).toHaveBeenCalledWith(window.devicePixelRatio)
        })

        it("should call renderer setSize", () => {
            // Arrange & Act
            threeRendererService["initGL"](1, 2)

            // Assert
            expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(1, 2)
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
