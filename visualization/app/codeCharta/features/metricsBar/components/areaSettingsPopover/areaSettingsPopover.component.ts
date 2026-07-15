import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { ResetSettingsButtonComponent } from "../../../shared/facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"

@Component({
    selector: "cc-area-settings-popover",
    templateUrl: "./areaSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class AreaSettingsPopoverComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly margin = toSignal(this.mapStateReadWindow.margin$, { initialValue: 0 })
    readonly enableFloorLabels = toSignal(this.mapStateReadWindow.enableFloorLabels$, { initialValue: false })
    readonly isInvertedArea = toSignal(this.mapStateReadWindow.invertArea$, { initialValue: false })

    readonly resetKeys = ["mapState.margin", "mapState.invertArea", "mapState.enableFloorLabels"]

    setMargin(margin: number) {
        this.metricsBarWriteStore.setMargin(margin)
    }

    setEnableFloorLabel(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setEnableFloorLabels(checked)
    }

    toggleInvertingArea(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setInvertArea(checked)
    }
}
