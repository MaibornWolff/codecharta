import { Component } from "@angular/core"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { Vector3 } from "three"

@Component({
    selector: "cc-zoom-slider",
    templateUrl: "./zoomSlider.component.html",
    styleUrls: ["./zoomSlider.component.scss"]
})
export class ZoomSliderComponent {
    zoomFactor: number

    constructor(
        private threeMapControlsService: ThreeMapControlsService,
        private threeCameraService: ThreeCameraService
    ) {
        this.threeMapControlsService.subscribe("onCameraChanged", () => this.refreshZoomFactor())
        this.zoomFactor = 100
    }

    refreshZoomFactor() {
        const camera = this.threeCameraService.camera
        const controls = this.threeMapControlsService.controls
        const distance = camera.position.distanceTo(controls.target)
        this.zoomFactor = this.getZoomPercentage(distance)
    }

    getZoomPercentage(distance: number) {
        const min = this.threeMapControlsService.controls.minDistance
        const max = this.threeMapControlsService.controls.maxDistance

        if (distance <= min) {
            return 500
        }
        if (distance >= max) {
            return 10
        }

        const range = max - min
        return 500 - ((distance - min) / range) * 490
    }

    getDistanceFromZoomPercentage(percentage: number) {
        const min = this.threeMapControlsService.controls.minDistance
        const max = this.threeMapControlsService.controls.maxDistance
        const range = max - min

        return min + ((500 - percentage) / 490) * range
    }

    onInput(event: Event) {
        const inputElement = event.target as HTMLInputElement
        const newZoomPercentage = Number.parseFloat(inputElement.value)

        this.setZoom(newZoomPercentage)
    }

    setZoom(zoomPercentage: number) {
        const newDistance = this.getDistanceFromZoomPercentage(zoomPercentage)

        const direction = new Vector3()
            .subVectors(this.threeCameraService.camera.position, this.threeMapControlsService.controls.target)
            .normalize()
        this.threeCameraService.camera.position
            .copy(this.threeMapControlsService.controls.target)
            .add(direction.multiplyScalar(newDistance))
        this.threeMapControlsService.controls.update()

        this.zoomFactor = zoomPercentage
    }

    zoomIn() {
        this.setZoom(this.zoomFactor + 10)
    }

    zoomOut() {
        this.setZoom(this.zoomFactor - 10)
    }
}
