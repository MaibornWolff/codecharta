import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, map } from "rxjs"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"
import { ColorRange } from "../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { debounce } from "../../../../util/debounce"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../../shared/facade"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
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
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsBarReadStore: MetricsBarReadStore,
        private readonly metricsBarWriteStore: MetricsBarWriteStore,
        private readonly metricsLensFacade: MetricsLensFacade
    ) {}

    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    readonly sliderValues = toSignal(this.metricsBarReadStore.metricColorRangeValues$, {
        initialValue: { values: [], min: 0, max: 0, from: 0, to: 0 }
    })
    readonly sliderColors = toSignal(this.metricsBarReadStore.metricColorRangeColors$, {
        initialValue: { leftColor: "#000", middleColor: "#000", rightColor: "#000" }
    })
    readonly isAttributeDirectionInversed = toSignal(
        combineLatest([this.mapStateReadWindow.colorMetric$, this.metricsLensFacade.descriptors$]).pipe(
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
        this.metricsBarWriteStore.setColorRange(newColorRange)
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
