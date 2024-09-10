import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { ThreeMapControlsService } from "./threeMapControls.service"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeSceneService } from "./threeSceneService"
import { Box3, BoxGeometry, Group, Mesh, MOUSE, PerspectiveCamera, Sphere, Vector3 } from "three"
import { ThreeRendererService } from "./threeRenderer.service"
import { wait } from "../../../util/testUtils/wait"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { MapControls } from "three/examples/jsm/controls/MapControls"
import { take } from "rxjs"
import { CodeMapMesh } from "../rendering/codeMapMesh"

describe("ThreeMapControlsService", () => {
    let threeMapControlsService: ThreeMapControlsService
    let threeCameraService: ThreeCameraService
    let threeSceneService: ThreeSceneService
    let threeRendererService: ThreeRendererService

    let vector: Vector3

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        restartSystem()
        rebuildService()
        withMockedThreeCameraService()
        withMockedThreeSceneService()
        withMockedControlService()
    })

    function restartSystem() {
        threeCameraService = TestBed.inject(ThreeCameraService)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeRendererService = TestBed.inject(ThreeRendererService)

        vector = new Vector3(5.711_079_128_159_569, 5.711_079_128_159_569, 0)
    }

    function withMockedThreeCameraService() {
        const camera = new PerspectiveCamera(100, 0, 0, 0)
        camera.position.set(vector.x, vector.y, vector.z)
        threeCameraService.camera = camera
    }

    function withMockedThreeSceneService() {
        threeSceneService.scene.add = jest.fn()
        threeSceneService.scene.remove = jest.fn()
        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
    }

    function withMockedControlService() {
        threeMapControlsService.controls = {
            target: new Vector3(1, 1, 1),
            minDistance: 100,
            maxDistance: 1_000_000
        } as unknown as MapControls
        threeMapControlsService.controls.update = jest.fn()
        threeMapControlsService.controls.addEventListener = jest.fn()
    }

    function rebuildService() {
        threeMapControlsService = new ThreeMapControlsService(threeCameraService, threeSceneService, threeRendererService)
    }

    describe("init", () => {
        it("should initialize MapControls and set up event listeners correctly", () => {
            const domElement = document.createElement("canvas")
            withMockedThreeCameraService()
            const addEventListenerMock = jest.fn()
            jest.spyOn(MapControls.prototype, "addEventListener").mockImplementation(addEventListenerMock)

            threeMapControlsService.controls = new MapControls(threeCameraService.camera, domElement)

            threeMapControlsService.init(domElement)

            expect(threeMapControlsService.controls).toBeDefined()
            expect(threeMapControlsService.controls.mouseButtons.LEFT).toBe(MOUSE.ROTATE)
            expect(threeMapControlsService.controls.mouseButtons.MIDDLE).toBe(MOUSE.DOLLY)
            expect(threeMapControlsService.controls.mouseButtons.RIGHT).toBe(MOUSE.PAN)
            expect(threeMapControlsService.controls.zoomToCursor).toBe(true)
            expect(addEventListenerMock).toHaveBeenCalledWith("change", expect.any(Function))
        })
    })

    it("rotateCameraInVectorDirection ", () => {
        threeMapControlsService.controls = {
            target: new Vector3(0, 0, 0)
        } as unknown as MapControls
        const vector = { x: 0, y: 1, z: 0 }

        threeMapControlsService.rotateCameraInVectorDirection(vector.x, vector.y, vector.z)

        expect(threeSceneService.scene.add).toHaveBeenCalled()
        expect(threeSceneService.scene.remove).toHaveBeenCalled()

        expect(threeCameraService.camera.position).toMatchSnapshot()
    })

    describe("setControlTarget", () => {
        it("should set the controlTarget to the store cameraTarget", () => {
            const result: Vector3 = new Vector3(1, 1, 1)
            threeMapControlsService.setControlTarget(new Vector3(1, 1, 1))

            expect(threeMapControlsService.controls.target).toEqual(result)
        })
    })

    describe("autoFitTo", () => {
        it("should auto fit map to its origin value ", async () => {
            threeCameraService.camera.position.set(0, 0, 0)

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeCameraService.camera.position).toEqual(new Vector3(8.724_905_929_183_022, 8.724_905_929_183_022, 0))
        })

        it("should call an control update", async () => {
            threeCameraService.camera.lookAt = jest.fn()

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeCameraService.camera.lookAt).toHaveBeenCalledWith(threeMapControlsService.controls.target)
        })

        it("should auto fit map to its original value ", async () => {
            threeCameraService.camera.updateProjectionMatrix = jest.fn()

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeMapControlsService.controls.update).toHaveBeenCalled()
            expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled()
        })

        it("should return early if boundingSphere.radius is -1", async () => {
            jest.spyOn(threeMapControlsService, "getBoundingSphere").mockReturnValue(new Sphere())
            threeCameraService.camera.position.set(0, 0, 0)

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeCameraService.camera.position).toEqual(new Vector3(0, 0, 0))
        })
    })

    describe("setZoomPercentage", () => {
        beforeEach(() => {
            rebuildService()
            withMockedControlService()
        })

        it("should set the correct zoom percentage and emit it", async () => {
            const initialZoom = 50

            threeMapControlsService.setZoomPercentage(initialZoom)

            let actualZoomPercentage: number
            threeMapControlsService.zoomPercentage$.pipe(take(1)).subscribe(zoomPercentage => (actualZoomPercentage = zoomPercentage))

            expect(actualZoomPercentage).toBe(initialZoom)
        })
    })

    describe("updateZoomPercentage", () => {
        it("should update the zoom percentage correctly", () => {
            threeCameraService.camera.position.set(0, 0, 500_000)
            threeMapControlsService.updateZoomPercentage()

            const distance = threeCameraService.camera.position.length()
            const expectedZoomPercentage = threeMapControlsService.getZoomPercentage(distance)

            let actualZoomPercentage: number
            threeMapControlsService.zoomPercentage$.pipe(take(1)).subscribe(zoomPercentage => (actualZoomPercentage = zoomPercentage))

            expect(actualZoomPercentage).toBeCloseTo(expectedZoomPercentage)
        })
    })

    describe("getZoomPercentage", () => {
        beforeEach(() => {
            threeMapControlsService.controls.minDistance = 100
            threeMapControlsService.controls.maxDistance = 1000
            threeMapControlsService.MAX_ZOOM = 200
            threeMapControlsService.MIN_ZOOM = 10
        })

        it("should return MAX_ZOOM if distance is less than or equal to minDistance", () => {
            expect(threeMapControlsService.getZoomPercentage(50)).toBe(200)
            expect(threeMapControlsService.getZoomPercentage(100)).toBe(200)
        })

        it("should return MIN_ZOOM if distance is greater than or equal to maxDistance", () => {
            expect(threeMapControlsService.getZoomPercentage(1000)).toBe(10)
            expect(threeMapControlsService.getZoomPercentage(1500)).toBe(10)
        })

        it("should return a zoom percentage between MIN_ZOOM and MAX_ZOOM for a distance within the min and max range", () => {
            const result = threeMapControlsService.getZoomPercentage(550)

            expect(result).toBeGreaterThan(10)
            expect(result).toBeLessThan(200)
        })
    })

    describe("focusNode", () => {
        beforeEach(() => {
            withMockedThreeSceneService()
            withMockedControlService()
        })

        it("should save the current camera position and focus on the specified node", async () => {
            const nodePath = "some/node/path"
            const mockNodeBoundingSphere = new Sphere(new Vector3(10, 10, 10), 8.660_254_037_844_387)
            const mockNodeBoundingBox = new Box3().setFromCenterAndSize(new Vector3(10, 10, 10), new Vector3(10, 10, 10))

            const mockNode = {
                boundingBox: mockNodeBoundingBox,
                boundingSphere: {
                    getBoundingSphere: jest.fn().mockReturnValue(mockNodeBoundingSphere)
                }
            }

            const mockMapMesh = {
                getBuildingByPath: jest.fn().mockReturnValue(mockNode)
            }

            jest.spyOn(threeSceneService, "getMapMesh").mockReturnValue(mockMapMesh as unknown as CodeMapMesh)

            const spyEnsureProperDistanceAndFocus = jest.spyOn(threeMapControlsService as never, "ensureProperDistanceAndFocus")

            threeMapControlsService.focusNode(nodePath)

            expect(threeMapControlsService.positionBeforeFocus).toEqual(threeCameraService.camera.position.clone())
            expect(mockMapMesh.getBuildingByPath).toHaveBeenCalledWith(nodePath)
            await wait(0)
            expect(spyEnsureProperDistanceAndFocus).toHaveBeenCalledWith(mockNodeBoundingSphere)
        })
    })

    describe("unfocusNode", () => {
        beforeEach(() => {
            withMockedControlService()
        })

        it("should move the camera back to positionBeforeFocus if defined", async () => {
            const previousPosition = new Vector3(0, 0, 100)
            threeMapControlsService.positionBeforeFocus = previousPosition.clone()
            threeCameraService.camera.position.set(10, 10, 10)

            threeMapControlsService.unfocusNode()
            await wait(1100)

            expect(threeCameraService.camera.position).toEqual(previousPosition)
        })

        it("should not move the camera if positionBeforeFocus is not defined", async () => {
            threeMapControlsService.positionBeforeFocus = undefined
            const initialPosition = threeCameraService.camera.position.clone()

            threeMapControlsService.unfocusNode()
            await wait(1100)

            expect(threeCameraService.camera.position).toEqual(initialPosition)
        })
    })
})
