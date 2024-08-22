import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"

@Component({
    selector: "cc-zoom-slider",
    templateUrl: "./zoomSlider.component.html",
    styleUrls: ["./zoomSlider.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomSliderComponent implements OnInit {
    zoomPercentage: number
    maxZoom: number
    minZoom: number

    constructor(
        private threeMapControlsService: ThreeMapControlsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.maxZoom = this.threeMapControlsService.MAX_ZOOM
        this.minZoom = this.threeMapControlsService.MIN_ZOOM

        this.threeMapControlsService.zoomPercentage$.subscribe(zoom => {
            this.zoomPercentage = zoom

            // Manually mark the component for change detection to prevent
            // ExpressionChangedAfterItHasBeenCheckedError thrown by angular
            // https://angular.dev/errors/NG0100
            this.cdr.detectChanges()
        })
    }

    onInput(event: Event) {
        const inputElement = event.target as HTMLInputElement
        const newZoomPercentage = Number.parseFloat(inputElement.value)

        this.threeMapControlsService.setZoomPercentage(newZoomPercentage)
    }

    zoomIn() {
        this.threeMapControlsService.setZoomPercentage(Math.min(this.zoomPercentage + 10, this.maxZoom))
    }

    zoomOut() {
        this.threeMapControlsService.setZoomPercentage(Math.max(this.zoomPercentage - 10, this.minZoom))
    }
}
