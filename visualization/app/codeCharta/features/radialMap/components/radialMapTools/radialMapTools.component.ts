import { ChangeDetectionStrategy, Component } from "@angular/core"
import { RadialMapScreenshotService, SCREENSHOT_CAPTURE, ScreenshotButtonComponent } from "../../../screenshot/facade"

@Component({
    selector: "cc-radial-map-tools",
    template: '<cc-toolbox-screenshot-button view="metrics"></cc-toolbox-screenshot-button>',
    imports: [ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: RadialMapScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-0.5" }
})
export class RadialMapToolsComponent {}
