import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HexMapColor } from "../../../../codeCharta.model"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { MapColorLabelPipe } from "../../../../util/pipes/mapColorLabel.pipe"
import { ColorMetricService } from "../../services/colorMetric.service"
import { ColorRangeService } from "../../services/colorRange.service"
import { MapColorsService } from "../../services/mapColors.service"
import { SelectedColorMetricDataService } from "../../services/selectedColorMetricData.service"
import { InlineColorPickerComponent } from "../../../shared/components/inlineColorPicker/inlineColorPicker.component"

@Component({
    selector: "cc-color-band-row",
    templateUrl: "./colorBandRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InlineColorPickerComponent, MapColorLabelPipe]
})
export class ColorBandRowComponent {
    constructor(
        private readonly colorMetricService: ColorMetricService,
        private readonly colorRangeService: ColorRangeService,
        private readonly selectedColorMetricDataService: SelectedColorMetricDataService,
        private readonly mapColorsService: MapColorsService
    ) {}

    readonly mapColorFor = input.required<HexMapColor>()
    readonly count = input<number | null>(null)

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly colorRange = toSignal(this.colorRangeService.colorRange$(), { initialValue: { from: 0, to: 0 } })
    readonly nodeMetricRange = toSignal(this.selectedColorMetricDataService.selectedColorMetricData$(), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)

    handleColorChange(newHexColor: string) {
        this.mapColorsService.setMapColors({ [this.mapColorFor()]: newHexColor })
    }
}
