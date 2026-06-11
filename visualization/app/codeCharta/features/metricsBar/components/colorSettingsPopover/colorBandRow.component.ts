import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState, MapColors } from "../../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { MapColorLabelPipe } from "../../../../ui/colorPickerForMapColor/mapColorLabel.pipe"
import { InlineColorPickerComponent } from "./inlineColorPicker.component"

export type BandMapColor = keyof Omit<MapColors, "labelColorAndAlpha" | "markingColors" | "isColorRangeInverted" | "areDeltaColorsInverted">

@Component({
    selector: "cc-color-band-row",
    templateUrl: "./colorBandRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InlineColorPickerComponent, MapColorLabelPipe]
})
export class ColorBandRowComponent {
    private readonly store: Store<CcState> = inject(Store)

    readonly mapColorFor = input.required<BandMapColor>()
    readonly count = input<number | null>(null)

    readonly colorMetric = toSignal(this.store.select(colorMetricSelector), { requireSync: true })
    readonly colorRange = toSignal(this.store.select(colorRangeSelector), { requireSync: true })
    readonly nodeMetricRange = toSignal(this.store.select(selectedColorMetricDataSelector), { requireSync: true })
    private readonly mapColors = toSignal(this.store.select(mapColorsSelector), { requireSync: true })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)

    handleColorChange(newHexColor: string) {
        this.store.dispatch(setMapColors({ value: { [this.mapColorFor()]: newHexColor } }))
    }
}
