import "./threeViewer.module"
import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { Settings } from "../../../codeCharta.model"
import { SETTINGS } from "../../../util/dataMocks"
import { PerspectiveCamera, Vector3 } from "three"
import { SettingsService } from "../../../state/settings.service"

describe("ThreeCameraService", () => {

    let threeCameraService : ThreeCameraService
    let $rootScope : IRootScopeService
    let settings : Settings

    beforeEach(() => {
        restartSystem()
        rebuildService()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

        $rootScope = getService<IRootScopeService>("$rootScope")

        settings = JSON.parse(JSON.stringify(SETTINGS))
    }

    function rebuildService() {
        threeCameraService = new ThreeCameraService($rootScope)
    }

    describe ("onSettingsChanged", () => {
        beforeEach(() => {
            threeCameraService.setPosition = jest.fn()
        })

        it("should not call setPosition if camera and lastCameraVector are the same", () => {
            const vector = new Vector3(0, 300, 1000)
            threeCameraService["lastCameraVector"] = vector

            threeCameraService.onSettingsChanged(settings, undefined)

            expect(threeCameraService.setPosition).not.toHaveBeenCalled()
        })

        it("should call setPosition if camera and lastCameraVector are not the same", () => {
            threeCameraService.onSettingsChanged(settings, undefined)

            expect(threeCameraService.setPosition).toHaveBeenCalledWith(0, 300, 1000)
        })

        it("should set lastCameraVector if camera and lastCameraVector are not the same", () => {
            threeCameraService.onSettingsChanged(settings, undefined)

            expect(threeCameraService["lastCameraVector"]).toEqual(new Vector3(0,300,1000))
        })
    })

    describe ("init", () => {
        beforeEach(() => {
            threeCameraService.setPosition = jest.fn()
            SettingsService.subscribe = jest.fn()
        })

        it("should set camera with a new aspect", () => {
            threeCameraService.init(400, 200, 1, 2, 3)

            expect(threeCameraService.camera.aspect).toBe(2)
        })

        it("should call setPosition with x, y and z", () => {
            threeCameraService.init(400, 200, 1, 2, 3)

            expect(threeCameraService.setPosition).toHaveBeenCalledWith(1, 2, 3)
        })

        it("should subscribe to SettingsService", () => {
            threeCameraService.init(400, 200, 1, 2, 3)

            expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, threeCameraService)
        })
    })

    describe ("setPosition", () => {
        it("should set camera position correctly", () => {
            threeCameraService.camera = new PerspectiveCamera()

            threeCameraService.setPosition(1, 2, 3)

            expect(threeCameraService.camera.position).toEqual({x: 1, y: 2, z: 3})
        })
    })
})