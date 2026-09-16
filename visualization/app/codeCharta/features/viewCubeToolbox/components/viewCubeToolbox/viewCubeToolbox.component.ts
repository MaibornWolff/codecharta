import { ChangeDetectionStrategy, Component, signal } from "@angular/core"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, ScreenshotService } from "../../../screenshot/facade"
import { FloatingMenuAnchor } from "../../../shared/facade"
import { CenterMapButtonComponent } from "../centerMapButton/centerMapButton.component"
import { CenterMapZoomMenuComponent } from "../centerMapZoomMenu/centerMapZoomMenu.component"
import { PresentationModeButtonComponent } from "../presentationModeButton/presentationModeButton.component"

@Component({
    selector: "cc-view-cube-toolbox",
    templateUrl: "./viewCubeToolbox.component.html",
    imports: [CenterMapButtonComponent, ScreenshotButtonComponent, PresentationModeButtonComponent, CenterMapZoomMenuComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: ScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewCubeToolboxComponent {
    // The zoom menu is positioned against the viewport, so it lives outside the toolbar: the toolbar's
    // own translate would make it the containing block and place the menu away from the cursor.
    protected readonly zoomMenuAnchor = signal<FloatingMenuAnchor | null>(null)
}
