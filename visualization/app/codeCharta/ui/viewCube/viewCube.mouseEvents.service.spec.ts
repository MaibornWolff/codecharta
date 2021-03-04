import { IRootScopeService } from "angular"
import { Group, Mesh, PerspectiveCamera, Vector2, WebGLRenderer } from "three"
import { getService } from "../../../../mocks/ng.mockhelper"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"

describe("ViewCubeMouseEventsService", () => {
	let viewCubeMouseEventsService: ViewCubeMouseEventsService
	let $rootScope: IRootScopeService
	let webGLRenderer: WebGLRenderer

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedWebGLRenderer()
	})

	function restartSystem() {
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		viewCubeMouseEventsService = new ViewCubeMouseEventsService($rootScope)
	}

	function withMockedWebGLRenderer() {
		const eventMap = {}
		webGLRenderer = new WebGLRenderer({
			context: ({
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
			} as unknown) as WebGLRenderingContext
		})

		webGLRenderer.domElement = ({
			addEventListener: jest.fn((event, callback) => {
				eventMap[event] = callback
			}),
			getBoundingClientRect: jest.fn().mockReturnValue({ left: 20, top: 20 }),
			width: 100,
			height: 100
		} as unknown) as HTMLCanvasElement

		webGLRenderer.getPixelRatio = jest.fn().mockReturnValue(2)
	}

	describe("init", () => {
		it("should call initRendererEventListeners", () => {
			viewCubeMouseEventsService["initRendererEventListeners"] = jest.fn()

			viewCubeMouseEventsService.init(new Group(), new PerspectiveCamera(), webGLRenderer)

			expect(viewCubeMouseEventsService["initRendererEventListeners"]).toHaveBeenCalledWith(webGLRenderer)
		})
	})

	describe("initRendererEventListeners", () => {
		beforeEach(() => {
			viewCubeMouseEventsService["initRendererEventListeners"](webGLRenderer)
		})
		it("should add mousemove listener", () => {
			expect(webGLRenderer.domElement.addEventListener).toBeCalledWith("mousemove", expect.any(Function))
		})

		it("should add mouseup listener", () => {
			expect(webGLRenderer.domElement.addEventListener).toBeCalledWith("mouseup", expect.any(Function))
		})

		it("should add mousedown listener", () => {
			expect(webGLRenderer.domElement.addEventListener).toBeCalledWith("mousedown", expect.any(Function))
		})

		it("should add dblclick listener", () => {
			expect(webGLRenderer.domElement.addEventListener).toBeCalledWith("dblclick", expect.any(Function))
		})
	})

	describe("checkMouseIntersection", () => {
		it("should triggerViewCubeEventPropagation when cube is not intersected with mouse", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(false)
			viewCubeMouseEventsService["triggerViewCubeEventPropagation"] = jest.fn()

			const mouseEvent = new MouseEvent("mouseup")

			viewCubeMouseEventsService["checkMouseIntersection"](mouseEvent, "")

			expect(viewCubeMouseEventsService["triggerViewCubeEventPropagation"]).toBeCalledWith("", mouseEvent)
		})

		it("should not triggerViewCubeEventPropagation when cube is intersected with mouse", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(true)
			viewCubeMouseEventsService["triggerViewCubeEventPropagation"] = jest.fn()

			const mouseEvent = new MouseEvent("mouseup")

			viewCubeMouseEventsService["checkMouseIntersection"](mouseEvent, "")

			expect(viewCubeMouseEventsService["triggerViewCubeEventPropagation"]).not.toBeCalled()
		})
	})

	describe("checkMouseIntersection", () => {
		it("should transform into canvas coordiante", () => {
			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["renderer"] = webGLRenderer

			const result = viewCubeMouseEventsService["transformIntoCanvasVector"](mouseEvent)

			expect(result).toStrictEqual(new Vector2(-1.76, 1.72))
		})
	})

	describe("onDocumentMouseMove", () => {
		it("should call getCubeIntersectedByMouse", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn()

			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

			expect(viewCubeMouseEventsService["getCubeIntersectedByMouse"]).toHaveBeenCalledWith(mouseEvent)
		})
		it("should call triggerViewCubeEventPropagation when no currentlyHovered and no cube intersection has been found", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(null)
			viewCubeMouseEventsService["triggerViewCubeEventPropagation"] = jest.fn()

			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeEventPropagation"]).toHaveBeenCalledWith("mousemove", mouseEvent)
		})

		it("should call triggerViewCubeUnhoverEvent when currentlyHovered and no cube intersection has been found", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(null)
			viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"] = jest.fn()
			viewCubeMouseEventsService["currentlyHovered"] = new Mesh()

			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"]).toBeCalled()
		})

		it("should call triggerViewCubeUnhoverEvent when currentlyHovered and cube intersection are not same", () => {
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue({ uuid: "1" })
			viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"] = jest.fn()
			viewCubeMouseEventsService["currentlyHovered"] = { uuid: "2" } as Mesh

			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeUnhoverEvent"]).toBeCalled()
		})

		it("should call triggerViewCubeHoverEvent when not currentlyHovered and cube intersection was found", () => {
			const mockedCube = { uuid: "1" }
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(mockedCube)
			viewCubeMouseEventsService["triggerViewCubeHoverEvent"] = jest.fn()
			viewCubeMouseEventsService["currentlyHovered"] = null

			const mouseEvent = new MouseEvent("mousedown", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseMove"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeHoverEvent"]).toBeCalledWith(mockedCube)
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
			viewCubeMouseEventsService["triggerViewCubeEventPropagation"] = jest.fn()

			const mouseEvent = new MouseEvent("mouseup", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseUp"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeEventPropagation"]).toHaveBeenCalledWith("mouseup", mouseEvent)
		})

		it("should call triggerViewCubeClickEvent when no cube intersection has been found", () => {
			const mockedCube = { uuid: "1" }
			viewCubeMouseEventsService["getCubeIntersectedByMouse"] = jest.fn().mockReturnValue(mockedCube)
			viewCubeMouseEventsService["triggerViewCubeClickEvent"] = jest.fn()

			const mouseEvent = new MouseEvent("mouseup", { clientX: 1, clientY: 2 })
			viewCubeMouseEventsService["onDocumentMouseUp"](mouseEvent)

			expect(viewCubeMouseEventsService["triggerViewCubeClickEvent"]).toHaveBeenCalledWith(mockedCube)
		})
	})
})
