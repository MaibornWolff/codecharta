import { ChangeDetectionStrategy, Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorMode } from "../../../../codeCharta.model"
import { ColorMetricService } from "../../services/colorMetric.service"
import { ColorModeService } from "../../services/colorMode.service"
import { IsHeightAndColorMetricLinkedService } from "../../services/isHeightAndColorMetricLinked.service"
import { MapColorsService } from "../../services/mapColors.service"
import { ColorRangeService } from "../../services/colorRange.service"
import { SelectedColorMetricDataService } from "../../services/selectedColorMetricData.service"
import { VisibleNodeMetricValuesService } from "../../services/visibleNodeMetricValues.service"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { AxisColorRampComponent } from "../axisColorRamp/axisColorRamp.component"
import { ColorSettingsPopoverComponent } from "../colorSettingsPopover/colorSettingsPopover.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-color-segment",
    templateUrl: "./colorSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        AxisCardComponent,
        AxisColorRampComponent,
        MetricSelectPopoverComponent,
        MetricMetaValueComponent,
        ColorSettingsPopoverComponent
    ]
})
export class ColorSegmentComponent {
    constructor(
        private readonly colorMetricService: ColorMetricService,
        private readonly colorModeService: ColorModeService,
        private readonly isHeightAndColorMetricLinkedService: IsHeightAndColorMetricLinkedService,
        private readonly visibleNodeMetricValuesService: VisibleNodeMetricValuesService,
        private readonly selectedColorMetricDataService: SelectedColorMetricDataService,
        private readonly colorRangeService: ColorRangeService,
        private readonly mapColorsService: MapColorsService
    ) {}

    readonly searchPopoverId = "metric-select-popover-color"
    readonly searchAnchorName = "metric-segment-color"
    readonly settingsPopoverId = "metric-settings-popover-color"
    readonly settingsAnchorName = "metric-segment-color-cog"

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly isLinked = toSignal(this.isHeightAndColorMetricLinkedService.isHeightAndColorMetricLinked$(), { initialValue: false })
    readonly visibleMetricValues = toSignal(this.visibleNodeMetricValuesService.visibleNodeMetricValues$(), { initialValue: {} })
    readonly colorMetricData = toSignal(this.selectedColorMetricDataService.selectedColorMetricData$(), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    readonly colorRange = toSignal(this.colorRangeService.colorRange$(), { initialValue: { from: null, to: null } })
    readonly colorMode = toSignal(this.colorModeService.colorMode$(), { initialValue: ColorMode.absolute })
    readonly mapColors = toSignal(this.mapColorsService.mapColors$())

    // Bar heights reflect the visible (rendered) buildings, but they are binned on the color
    // metric's global value axis — the same range the color thresholds (from/to) are derived
    // from — so the ramp's colors line up with the 3D map and the color settings popover.
    readonly currentMetric = computed(() => this.visibleMetricValues()[this.colorMetric()] ?? null)
    readonly values = computed(() => this.currentMetric()?.values ?? [])
    readonly minValue = computed(() => this.colorMetricData().minValue)
    readonly maxValue = computed(() => this.colorMetricData().maxValue)
    readonly minLabel = computed(() => this.minValue().toLocaleString())
    readonly maxLabel = computed(() => this.maxValue().toLocaleString())

    handleMetricSelected(value: string) {
        this.colorMetricService.setColorMetric(value)
    }
}
