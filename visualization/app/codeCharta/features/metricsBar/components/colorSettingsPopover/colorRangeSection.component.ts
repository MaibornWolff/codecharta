import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, map } from "rxjs"
import { ColorRange } from "../../../../codeCharta.model"
import { debounce } from "../../../../util/debounce"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"
import { ColorMetricService } from "../../services/colorMetric.service"
import { ColorRangeService } from "../../services/colorRange.service"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../util/settingsInput"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"
import { HandleValueChange, MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"

@Component({
    selector: "cc-color-range-section",
    templateUrl: "./colorRangeSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [MetricColorRangeSliderComponent, MetricColorRangeDiagramComponent]
})
export class ColorRangeSectionComponent implements OnDestroy {
    constructor(
        private readonly colorRangeService: ColorRangeService,
        private readonly colorMetricService: ColorMetricService,
        private readonly metricsLensFacade: MetricsLensFacade
    ) {}

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly sliderValues = toSignal(this.colorRangeService.metricColorRangeValues$(), {
        initialValue: { values: [], min: 0, max: 0, from: 0, to: 0 }
    })
    readonly sliderColors = toSignal(this.colorRangeService.metricColorRangeColors$(), {
        initialValue: { leftColor: "#000", middleColor: "#000", rightColor: "#000" }
    })
    readonly isAttributeDirectionInversed = toSignal(
        combineLatest([this.colorMetricService.colorMetric$(), this.metricsLensFacade.descriptors$]).pipe(
            map(([colorMetric, attributeDescriptors]) => attributeDescriptors[colorMetric]?.direction === 1)
        ),
        { initialValue: false }
    )

    private pendingLeftValue: null | number = null
    private pendingRightValue: null | number = null

    private readonly commitColorRange = debounce(() => {
        const newColorRange: Partial<ColorRange> = {}
        if (this.pendingLeftValue !== null) {
            newColorRange.from = this.pendingLeftValue
        }
        if (this.pendingRightValue !== null) {
            newColorRange.to = this.pendingRightValue
        }
        this.pendingLeftValue = null
        this.pendingRightValue = null
        this.colorRangeService.setColorRange(newColorRange)
    }, SETTINGS_INPUT_DEBOUNCE_MS)

    handleValueChange: HandleValueChange = ({ newLeftValue, newRightValue }) => {
        this.pendingLeftValue = newLeftValue ?? this.pendingLeftValue
        this.pendingRightValue = newRightValue ?? this.pendingRightValue
        this.commitColorRange()
    }

    ngOnDestroy(): void {
        // commit instead of discarding: a pending threshold adjustment must not be
        // silently dropped when the popover is destroyed within the debounce window
        this.commitColorRange.flush()
    }
}
