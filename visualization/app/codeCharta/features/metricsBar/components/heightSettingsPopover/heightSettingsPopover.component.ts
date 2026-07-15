import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { ResetSettingsButtonComponent } from "../../../shared/facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"

@Component({
    selector: "cc-height-settings-popover",
    templateUrl: "./heightSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class HeightSettingsPopoverComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly scalingY = toSignal(this.mapStateReadWindow.scaling$, { initialValue: { x: 1, y: 1, z: 1 } })
    readonly invertHeight = toSignal(this.mapStateReadWindow.invertHeight$, { initialValue: false })
    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })

    readonly resetKeys = ["mapState.scaling.y", "mapState.invertHeight"]

    setScalingY(y: number) {
        this.metricsBarWriteStore.setScaling({ y })
    }

    toggleInvertHeight(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setInvertHeight(checked)
    }
}
