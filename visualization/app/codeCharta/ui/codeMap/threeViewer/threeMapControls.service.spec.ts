import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { ThreeMapControlsService } from "./threeMapControls.service"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeSceneService } from "./threeSceneService"
import { BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from "three"
import { ThreeRendererService } from "./threeRenderer.service"
import { wait } from "../../../util/testUtils/wait"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { MapControls } from "three/examples/jsm/controls/MapControls"

describe("ThreeOrbitControlsService", () => {
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
            target: new Vector3(1, 1, 1)
        } as unknown as MapControls
        threeMapControlsService.controls.update = jest.fn()
    }

    function rebuildService() {
        threeMapControlsService = new ThreeMapControlsService(threeCameraService, threeSceneService, threeRendererService)
    }

    it("rotateCameraInVectorDirection ", () => {
        threeMapControlsService.controls = {
            target: new Vector3(0, 0, 0)
        } as unknown as MapControls
        const vector = { x: 0, y: 1, z: 0 }

        threeMapControlsService.rotateCameraInVectorDirection(vector.x, vector.y, vector.z)

        expect(threeSceneService.scene.add).toBeCalled()
        expect(threeSceneService.scene.remove).toBeCalled()

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

            expect(threeCameraService.camera.position).toEqual(vector)
        })

        it("should call an control update", async () => {
            threeCameraService.camera.lookAt = jest.fn()

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeCameraService.camera.lookAt).toBeCalledWith(threeMapControlsService.controls.target)
        })

        it("should auto fit map to its original value ", async () => {
            threeCameraService.camera.updateProjectionMatrix = jest.fn()

            threeMapControlsService.autoFitTo()
            await wait(0)

            expect(threeMapControlsService.controls.update).toBeCalled()
            expect(threeCameraService.camera.updateProjectionMatrix).toBeCalled()
        })
    })
})
