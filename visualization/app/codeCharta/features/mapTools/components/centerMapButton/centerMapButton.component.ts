import { ChangeDetectionStrategy, Component, inject, output } from "@angular/core"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { FloatingMenuAnchor } from "../../../shared/facade"

@Component({
    selector: "cc-toolbox-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CenterMapButtonComponent {
    protected readonly mapControls = inject(ThreeMapControlsService)
    readonly zoomMenuRequested = output<FloatingMenuAnchor>()

    protected requestZoomMenu(event: MouseEvent) {
        event.preventDefault()
        this.zoomMenuRequested.emit({ x: event.clientX, y: event.clientY })
    }
}
