import { ChangeDetectionStrategy, Component } from "@angular/core"
import { SCREENSHOT_CAPTURE, ScreenshotButtonComponent, WordCloudScreenshotService } from "../../../screenshot/facade"

@Component({
    selector: "cc-domain-toolbox",
    templateUrl: "./domainToolbox.component.html",
    imports: [ScreenshotButtonComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: WordCloudScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-0.5" }
})
export class DomainToolboxComponent {}
