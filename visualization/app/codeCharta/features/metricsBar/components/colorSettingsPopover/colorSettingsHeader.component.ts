import { ChangeDetectionStrategy, Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { defaultMapColors } from "../../../../mapState/mapState.facade"
import { calculateInitialColorRange } from "../../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { ColorMetricService } from "../../services/colorMetric.service"
import { ColorRangeService } from "../../services/colorRange.service"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { MapColorsService } from "../../services/mapColors.service"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"

@Component({
    selector: "cc-color-settings-header",
    templateUrl: "./colorSettingsHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class ColorSettingsHeaderComponent {
    constructor(
        private readonly colorMetricService: ColorMetricService,
        private readonly isDeltaStateService: IsDeltaStateService,
        private readonly mapColorsService: MapColorsService,
        private readonly colorRangeService: ColorRangeService,
        private readonly metricsLensFacade: MetricsLensFacade
    ) {}

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    private readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })
    private readonly selectedColorMetricData = toSignal(this.metricsLensFacade.selectedColorMetricData$, {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })

    readonly canResetThresholds = computed(() => !this.isDeltaState() && this.colorMetric() !== "unary")

    readonly swatchGradient = computed(() => {
        const colors = this.mapColors()
        return this.isDeltaState()
            ? `linear-gradient(90deg, ${colors.positiveDelta}, ${colors.negativeDelta})`
            : `linear-gradient(90deg, ${colors.positive}, ${colors.neutral}, ${colors.negative})`
    })

    resetThresholds() {
        this.colorRangeService.setColorRange(calculateInitialColorRange(this.selectedColorMetricData()))
    }
}
