import { ChangeDetectionStrategy, Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ResetSettingsButtonComponent } from "../../../../features/shared/components/resetSettingsButton/resetSettingsButton.component"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"

@Component({
    selector: "cc-invert-reset-row",
    templateUrl: "./invertResetRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent]
})
export class InvertResetRowComponent {
    constructor(
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })
    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })

    readonly isColorRangeInverted = computed(() => this.mapColors().isColorRangeInverted ?? false)
    readonly areDeltaColorsInverted = computed(() => this.mapColors().areDeltaColorsInverted ?? false)

    handleIsColorRangeInvertedChange() {
        this.metricsBarWriteStore.invertColorRange()
    }

    handleAreDeltaColorsInvertedChange() {
        this.metricsBarWriteStore.invertDeltaColors()
    }

    resetColorsKeys() {
        return this.isDeltaState()
            ? [
                  "mapState.mapColors.positiveDelta",
                  "mapState.mapColors.negativeDelta",
                  "mapState.mapColors.selected",
                  "mapState.mapColors.areDeltaColorsInverted"
              ]
            : [
                  "mapState.mapColors.positive",
                  "mapState.mapColors.negative",
                  "mapState.mapColors.neutral",
                  "mapState.mapColors.selected",
                  "mapState.mapColors.isColorRangeInverted",
                  "mapState.colorMode"
              ]
    }
}
