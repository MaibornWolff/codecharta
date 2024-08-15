import { Group, Mesh, PerspectiveCamera, Vector2, WebGLRenderer } from "three"
import { ThreeMapControlsService } from "../codeMap/threeViewer/threeMapControls.service"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CursorType } from "../codeMap/codeMap.mouseEvent.service"

jest.mock("three", () => ({
    ...jest.requireActual("three"),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
        domElement: {
            addEventListener: jest.fn(),
            getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 100,
                height: 100
            })
        },
        getPixelRatio: jest.fn().mockReturnValue(2),
        context: {
            getParameter: jest.fn().mockReturnValue(["WebGL 2"]),
            getExtension: jest.fn().mockReturnValue({}),
            alpha: true
        }
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({}))
}))

jest.mock("three/examples/jsm/controls/OrbitControls", () => {
    return {
        OrbitControls: jest.fn()
    }
})

describe("ViewCubeMouseEventsService", () => {
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let threeMapControlsService: ThreeMapControlsService
    let webGLRenderer: WebGLRenderer

    beforeEach(() => {
        viewCubeMouseEventsService = new ViewCubeMouseEventsService(threeMapControlsService)

        const eventMap = {}
        webGLRenderer = new WebGLRenderer()

        webGLRenderer.domElement = {
            addEventListener: jest.fn((event, callback) => {
                eventMap[event] = callback
            }),
            getBoundingClientRect: jest.fn().mockReturnValue({ left: 20, top: 20 }),
            width: 100,
            height: 100
        } as unknown as HTMLCanvasElement

        webGLRenderer.getPixelRatio = jest.fn().mockReturnValue(2)
    })

    describe("init", () => {
        it("should call initRendererEventListeners and initOrbitalControl", () => {
            viewCubeMouseEventsService["initRendererEventListeners"] = jest.fn()
            viewCubeMouseEventsService["initOrbitalControl"] = jest.fn()
            const camera = new PerspectiveCamera()

            viewCubeMouseEventsService.init(new Group(), camera, webGLRenderer)

            expect(viewCubeMouseEventsService["initRendererEventListeners"]).toHaveBeenCalledWith(webGLRenderer)
            expect(viewCubeMouseEventsService["initOrbitalControl"]).toHaveBeenCalledWith(camera, webGLRenderer)
        })
    })

    describe("initOrbitalControl", () => {
        it("should initialize controls with parameters", () => {
            const camera = new PerspectiveCamera()
            const expectedControls = new OrbitControls(camera, webGLRenderer.domElement)
            expectedControls.enableZoom = false
            expectedControls.enablePan = false
            expectedControls.rotateSpeed = 1

            viewCubeMouseEventsService["initOrbitalControl"](camera, webGLRenderer)

            const receivedControls = viewCubeMouseEventsService["controls"]

            expect(JSON.stringify(receivedControls)).toMatch(JSON.stringify(expectedControls))
        })
    })

    describe("initRendererEventListeners", () => {
        beforeEach(() => {
            viewCubeMouseEventsService["initRendererEventListeners"](webGLRenderer)
        })
        it("should add mousemove listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function))
        })

        it("should add mouseup listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function))
        })

        it("should add mousedown listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should add dblclick listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("dblclick", expect.any(Function))
        })

        it("should add mouseleave listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("mouseleave", expect.any(Function))
        })

        it("should add mouseenter listener", () => {
            expect(webGLRenderer.domElement.addEventListener).toHaveBeenCalledWith("mouseenter", expect.any(Function))
        })
    })

    describe("onDocumentMouseClick", () => {
        it("should call checkMouseIntersection", () => {
            viewCubeMouseEventsService["checkMouseIntersection"] = jest.fn()

            viewCubeMouseEventsService["onDocumentMouseClick"]({} as MouseEvent, "")

            expect(viewCubeMouseEventsService["checkMouseIntersection"]).toHaveBeenCalled()
            expect(viewCubeMouseEventsService["isDragging"]).toEqual(true)
        })
    })

    describe("onWindowMouseLeave", () => {
        it("should call enableRotation", () => {
            viewCubeMouseEventsService["enableRotation"] = jest.fn()

            viewCubeMouseEventsService["onWindowMouseLeave"]({ relatedTarget: null } as MouseEvent)

            expect(viewCubeMouseEventsService["enableRotation"]).toHaveBeenCalled()
        })
    })

    describe("onDocumentMouseEnter", () => {
        it("should call enableRotation", () => {
            viewCubeMouseEventsService["enableRotation"] = jest.fn()

            viewCubeMouseEventsService["onDocumentMouseEnter"]()

            expect(viewCubeMouseEventsService["enableRotation"]).toHaveBeenCalled()
        })
    })

    describe("checkMouseIntersection", () => {
        it("should triggerViewCubeEventPropagation when cube is not intersected with mouse", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(false)
            viewCubeMouseEventsService["eventEmitter"]["emit"] = jest.fn()
            const mouseEvent = new MouseEvent("mouseup")
            viewCubeMouseEventsService["checkMouseIntersection"](mouseEvent, "mouseup")
            expect(viewCubeMouseEventsService["eventEmitter"]["emit"]).toHaveBeenCalledWith("viewCubeEventPropagation", {
                type: "mouseup",
                event: mouseEvent
            })
        })

        it("should not triggerViewCubeEventPropagation when cube is intersected with mouse", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(true)
            viewCubeMouseEventsService["eventEmitter"]["emit"] = jest.fn()

            const mouseEvent = new MouseEvent("mouseup")

            viewCubeMouseEventsService["checkMouseIntersection"](mouseEvent, "mouseup")

            expect(viewCubeMouseEventsService["eventEmitter"]["emit"]).not.toHaveBeenCalledWith(
                "viewCubeEventPropagation",
                expect.anything()
            )
        })
    })

    describe("checkMouseIntersection", () => {
        it("should transform into canvas coordinate", () => {
            const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["renderer"] = webGLRenderer

            const result = viewCubeMouseEventsService["transformIntoCanvasVector"](mouseEvent)

            expect(result).toStrictEqual(new Vector2(-1.76, 1.72))
        })
    })

    describe("getCubeIntersectedByMouse", () => {
        it("should call transformIntoCanvasVector and return null", () => {
            viewCubeMouseEventsService["camera"] = new PerspectiveCamera()
            viewCubeMouseEventsService["transformIntoCanvasVector"] = jest.fn().mockReturnValue(new Vector2(0, 0))
            viewCubeMouseEventsService["cubeGroup"] = new Group()

            const returnValue = viewCubeMouseEventsService["getCubeIntersectedByMouse"]({} as MouseEvent)

            expect(viewCubeMouseEventsService["transformIntoCanvasVector"]).toHaveBeenCalled()
            expect(returnValue).toEqual(null)
        })
    })

    describe("onDocumentMouseMove", () => {
        it("should call getCubeIntersectedByMouse", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn()

            const mouseEvent = new MouseEvent("mousemove", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

            expect(viewCubeMouseEventsService["getCubeIntersectedByMouse"]).toHaveBeenCalledWith(mouseEvent)
        })

        it("should call triggerViewCubeEventPropagation when no currentlyHovered and no cube intersection has been found", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(null)
            viewCubeMouseEventsService["eventEmitter"]["emit"] = jest.fn()

            const mouseEvent = new MouseEvent("mousemove", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

            expect(viewCubeMouseEventsService["eventEmitter"]["emit"]).toHaveBeenCalledWith("viewCubeEventPropagation", {
                type: "mousemove",
                event: mouseEvent
            })
        })

        it("should call triggerViewCubeUnhoverEvent when currentlyHovered and no cube intersection has been found", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(null)
            viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"] = jest.fn()
            viewCubeMouseEventsService["currentlyHovered"] = new Mesh()

            const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

            expect(viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"]).toHaveBeenCalled()
        })

        it("should call triggerViewCubeUnhoverEvent when currentlyHovered and cube intersection are not same", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue({ uuid: "1" })
            viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"] = jest.fn()
            viewCubeMouseEventsService["currentlyHovered"] = { uuid: "2" } as Mesh

            const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

            expect(viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"]).toHaveBeenCalled()
        })

        it("should call triggerViewCubeHoverEvent when not currentlyHovered and cube intersection was found", () => {
            const mockedCube = { uuid: "1" }
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(mockedCube)
            viewCubeMouseEventsService["triggerViewCubeHoverEvent"] = jest.fn()
            viewCubeMouseEventsService["currentlyHovered"] = null

            const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

            expect(viewCubeMouseEventsService["triggerViewCubeHoverEvent"]).toHaveBeenCalledWith(mockedCube)
        })
    })

    describe("onDocumentMouseUp", () => {
        it("should call getCubeIntersectedByMouse", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn()

            const mouseEvent = new MouseEvent("mouseup", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseUp"](mouseEvent)

            expect(viewCubeMouseEventsService["getCubeIntersectedByMouse"]).toHaveBeenCalledWith(mouseEvent)
        })

        it("should call triggerViewCubeEventPropagation when no cube intersection has been found", () => {
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(null)
            viewCubeMouseEventsService["eventEmitter"]["emit"] = jest.fn()

            const mouseEvent = new MouseEvent("mouseup", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseUp"](mouseEvent)

            expect(viewCubeMouseEventsService["eventEmitter"]["emit"]).toHaveBeenCalledWith("viewCubeEventPropagation", {
                type: "mouseup",
                event: mouseEvent
            })
        })

        it("should call triggerViewCubeClickEvent when no cube intersection has been found", () => {
            const mockedCube = { uuid: "1" }
            viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(mockedCube)
            viewCubeMouseEventsService["eventEmitter"]["emit"] = jest.fn()

            const mouseEvent = new MouseEvent("mouseup", { clientX: 1, clientY: 2 })
            viewCubeMouseEventsService["onDocumentMouseUp"](mouseEvent)

            expect(viewCubeMouseEventsService["eventEmitter"]["emit"]).toHaveBeenCalledWith("viewCubeClicked", { cube: mockedCube })
        })
    })

    describe("triggerViewCubeHoverEvent", () => {
        it("should change cursor indicator", () => {
            const cube = new Mesh()
            viewCubeMouseEventsService["triggerViewCubeHoverEvent"](cube)
            expect(viewCubeMouseEventsService["currentlyHovered"]).toEqual(cube)
            expect(document.body.style.cursor).toEqual(CursorType.Pointer)
        })
    })

    describe("triggerViewCubeUnhoverEvent", () => {
        it("should change cursor indicator", () => {
            viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"]()
            expect(viewCubeMouseEventsService["currentlyHovered"]).toEqual(null)
            expect(document.body.style.cursor).toEqual(CursorType.Default)
        })
    })
})
