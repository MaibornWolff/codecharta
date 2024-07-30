import { PerspectiveCamera, Vector3 } from "three"
import { ThreeCameraService } from "./threeCamera.service"
import { expect } from "@jest/globals"

describe("ThreeCameraService", () => {
    let threeCameraService: ThreeCameraService

    beforeEach(() => {
        threeCameraService = new ThreeCameraService()
        threeCameraService.camera = new PerspectiveCamera()
    })
    describe("init", () => {
        it("should set camera with a new aspect", () => {
            threeCameraService.init(400, 200)
            expect(threeCameraService.camera.aspect).toBe(2)
        })

        it("should call setPosition with x, y and z", () => {
            threeCameraService.setPosition = jest.fn()
            threeCameraService.init(400, 200)
            expect(threeCameraService.setPosition).toHaveBeenCalled()
        })
    })

    describe("setPosition", () => {
        it("should set camera position correctly", () => {
            threeCameraService.setPosition(new Vector3(1, 2, 3))
            expect(threeCameraService.camera.position).toEqual({ x: 1, y: 2, z: 3 })
        })
    })

    describe("setZoomFactor", () => {
        it("should set zoomFactor correctly", () => {
            threeCameraService.setZoomFactor(2)
            expect(threeCameraService.camera.zoom).toEqual(2)
        })
    })

    describe("zoomIn", () => {
        beforeEach(() => {
            threeCameraService.init(400, 200)
            threeCameraService.setZoomFactor(1)
        })

        it("should change zoomFactor correctly", () => {
            jest.spyOn(threeCameraService, "setZoomFactor")
            threeCameraService.zoomIn()
            expect(threeCameraService.camera.zoom).toEqual(1.25)
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(1.25)
        })

        it("should not exceed MAX_ZOOM_FACTOR", () => {
            threeCameraService.setZoomFactor(ThreeCameraService.MAX_ZOOM_Factor)
            jest.spyOn(threeCameraService, "setZoomFactor")
            threeCameraService.zoomIn()
            expect(threeCameraService.camera.zoom).toEqual(ThreeCameraService.MAX_ZOOM_Factor)
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(ThreeCameraService.MAX_ZOOM_Factor)
        })
    })

    describe("zoomOut", () => {
        beforeEach(() => {
            threeCameraService.init(400, 200)
            threeCameraService.setZoomFactor(1)
        })

        it("should change zoomFactor correctly", () => {
            jest.spyOn(threeCameraService, "setZoomFactor")
            threeCameraService.zoomOut()
            expect(threeCameraService.camera.zoom).toEqual(0.75)
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(0.75)
        })

        it("should not fall behind MIN_ZOOM_FACTOR", () => {
            threeCameraService.setZoomFactor(ThreeCameraService.MIN_ZOOM_Factor)
            jest.spyOn(threeCameraService, "setZoomFactor")
            threeCameraService.zoomOut()
            expect(threeCameraService.camera.zoom).toEqual(ThreeCameraService.MIN_ZOOM_Factor)
            expect(threeCameraService.setZoomFactor).toHaveBeenCalledWith(ThreeCameraService.MIN_ZOOM_Factor)
        })
    })
})
