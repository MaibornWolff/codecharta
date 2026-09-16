import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { FloatingMenuAnchor, FloatingMenuComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { ViewCubeToolboxReadStore } from "../../stores/viewCubeToolbox.read.store"
import { ViewCubeToolboxWriteStore } from "../../stores/viewCubeToolbox.write.store"

@Component({
    selector: "cc-center-map-zoom-menu",
    templateUrl: "./centerMapZoomMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [FloatingMenuComponent, SliderNumberInputComponent]
})
export class CenterMapZoomMenuComponent {
    private readonly mapControls = inject(ThreeMapControlsService)
    private readonly readStore = inject(ViewCubeToolboxReadStore)
    private readonly writeStore = inject(ViewCubeToolboxWriteStore)

    readonly anchor = input.required<FloatingMenuAnchor>()
    readonly dismissed = output<void>()

    protected readonly centerMapZoom = this.readStore.centerMapZoom
    protected readonly minZoom = this.mapControls.MIN_ZOOM
    protected readonly maxZoom = this.mapControls.MAX_ZOOM

    // Applying the value to the camera as it changes is what makes the number pickable: without the
    // preview the user has to close the menu and press the button to see what they chose.
    protected previewAndStore(zoom: number) {
        this.writeStore.setCenterMapZoom(zoom)
        this.mapControls.setZoomPercentage(zoom)
    }

    protected useCurrentZoom() {
        this.writeStore.setCenterMapZoom(Math.round(this.mapControls.zoomPercentage$.value))
    }

    protected resetCenterMapZoom() {
        this.previewAndStore(this.readStore.defaultCenterMapZoom)
    }
}
