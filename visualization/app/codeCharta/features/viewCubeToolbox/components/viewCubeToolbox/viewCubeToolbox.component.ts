import { ChangeDetectionStrategy, Component } from "@angular/core"
import { CenterMapButtonComponent } from "../centerMapButton/centerMapButton.component"
import { PresentationModeButtonComponent } from "../presentationModeButton/presentationModeButton.component"
import { ScreenshotButtonComponent } from "../screenshotButton/screenshotButton.component"

@Component({
    selector: "cc-view-cube-toolbox",
    templateUrl: "./viewCubeToolbox.component.html",
    imports: [CenterMapButtonComponent, ScreenshotButtonComponent, PresentationModeButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewCubeToolboxComponent {}
