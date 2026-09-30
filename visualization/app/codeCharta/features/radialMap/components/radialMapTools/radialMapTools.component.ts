import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { RadialMapScreenshotService, SCREENSHOT_CAPTURE, ScreenshotButtonComponent } from "../../../screenshot/facade"
import { BarToolsDividerComponent, UnfocusToolComponent } from "../../../shared/facade"
import { RadialMapReadStore } from "../../stores/radialMap.read.store"
import { RadialMapWriteStore } from "../../stores/radialMap.write.store"

@Component({
    selector: "cc-radial-map-tools",
    templateUrl: "./radialMapTools.component.html",
    imports: [BarToolsDividerComponent, ScreenshotButtonComponent, UnfocusToolComponent],
    providers: [{ provide: SCREENSHOT_CAPTURE, useExisting: RadialMapScreenshotService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-0.5" }
})
export class RadialMapToolsComponent {
    private readonly writeStore = inject(RadialMapWriteStore)

    protected readonly isFocused = toSignal(inject(RadialMapReadStore).isFocused$, { requireSync: true })

    protected unfocus() {
        this.writeStore.unfocusAll()
    }
}
