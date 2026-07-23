import { ChangeDetectionStrategy, Component } from "@angular/core"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, ScreenshotService } from "../../../screenshot/facade"
import { CenterMapButtonComponent } from "../centerMapButton/centerMapButton.component"
import { PresentationModeButtonComponent } from "../presentationModeButton/presentationModeButton.component"

@Component({
    selector: "cc-view-cube-toolbox",
    templateUrl: "./viewCubeToolbox.component.html",
    imports: [CenterMapButtonComponent, ScreenshotButtonComponent, PresentationModeButtonComponent],
    // The metrics view's screenshot button captures the map.
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: ScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewCubeToolboxComponent {}
