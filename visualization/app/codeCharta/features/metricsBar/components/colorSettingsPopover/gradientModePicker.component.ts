import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorMode } from "../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"

@Component({
    selector: "cc-gradient-mode-picker",
    templateUrl: "./gradientModePicker.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class GradientModePickerComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    /** Unique radio group name, so multiple popovers in the DOM cannot cross-link. */
    readonly groupName = input.required<string>()

    readonly colorMode = toSignal(this.mapStateReadWindow.colorMode$, { initialValue: "absolute" as ColorMode })

    handleColorModeChange(value: string) {
        this.metricsBarWriteStore.setColorMode(value as ColorMode)
    }
}
