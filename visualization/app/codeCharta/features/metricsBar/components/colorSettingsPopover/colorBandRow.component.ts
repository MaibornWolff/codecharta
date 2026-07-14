import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HexMapColor } from "../../../../model/codeCharta.model"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MapColorLabelPipe } from "../../../../util/pipes/mapColorLabel.pipe"
import { InlineColorPickerComponent } from "../../../shared/components/inlineColorPicker/inlineColorPicker.component"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"

@Component({
    selector: "cc-color-band-row",
    templateUrl: "./colorBandRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InlineColorPickerComponent, MapColorLabelPipe]
})
export class ColorBandRowComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsBarReadStore: MetricsBarReadStore,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    readonly mapColorFor = input.required<HexMapColor>()
    readonly count = input<number | null>(null)

    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    readonly colorRange = toSignal(this.mapStateReadWindow.colorRange$, { initialValue: { from: 0, to: 0 } })
    readonly nodeMetricRange = toSignal(this.metricsBarReadStore.selectedColorMetricData$, {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)

    handleColorChange(newHexColor: string) {
        this.metricsBarWriteStore.setMapColors({ [this.mapColorFor()]: newHexColor })
    }
}
