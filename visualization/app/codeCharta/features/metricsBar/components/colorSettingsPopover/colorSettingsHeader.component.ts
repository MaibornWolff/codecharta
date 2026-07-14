import { ChangeDetectionStrategy, Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { calculateInitialColorRange } from "../../../../util/color/calculateInitialColorRange"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"

@Component({
    selector: "cc-color-settings-header",
    templateUrl: "./colorSettingsHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class ColorSettingsHeaderComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly metricsBarReadStore: MetricsBarReadStore,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    private readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })
    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })
    private readonly selectedColorMetricData = toSignal(this.metricsBarReadStore.selectedColorMetricData$, {
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
        this.metricsBarWriteStore.setColorRange(calculateInitialColorRange(this.selectedColorMetricData()))
    }
}
