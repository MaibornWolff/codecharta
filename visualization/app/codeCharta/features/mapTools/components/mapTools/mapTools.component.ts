import { ChangeDetectionStrategy, Component, signal } from "@angular/core"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, ScreenshotService } from "../../../screenshot/facade"
import { FloatingMenuAnchor } from "../../../shared/facade"
import { CenterMapButtonComponent } from "../centerMapButton/centerMapButton.component"
import { CenterMapZoomMenuComponent } from "../centerMapZoomMenu/centerMapZoomMenu.component"
import { PresentationModeButtonComponent } from "../presentationModeButton/presentationModeButton.component"

@Component({
    selector: "cc-map-tools",
    templateUrl: "./mapTools.component.html",
    imports: [CenterMapButtonComponent, ScreenshotButtonComponent, PresentationModeButtonComponent, CenterMapZoomMenuComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: ScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-0.5" }
})
export class MapToolsComponent {
    protected readonly zoomMenuAnchor = signal<FloatingMenuAnchor | null>(null)
}
