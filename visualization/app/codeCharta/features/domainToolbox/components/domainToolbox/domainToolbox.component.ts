import { ChangeDetectionStrategy, Component } from "@angular/core"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, WordCloudScreenshotService } from "../../../screenshot/facade"

/**
 * The domain view's floating toolbox — the counterpart of the metrics view's view-cube toolbox, which
 * additionally carries the map-only center and presentation controls. Only the screenshot applies to a
 * word cloud, so the strip holds just that button, and captures the cloud rather than the map.
 */
@Component({
    selector: "cc-domain-toolbox",
    templateUrl: "./domainToolbox.component.html",
    imports: [ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: WordCloudScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainToolboxComponent {}
