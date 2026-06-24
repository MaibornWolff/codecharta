import { ChangeDetectionStrategy, Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { ResetSettingsButtonComponent } from "../../../../features/shared/components/resetSettingsButton/resetSettingsButton.component"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { MapColorsService } from "../../services/mapColors.service"

@Component({
    selector: "cc-invert-reset-row",
    templateUrl: "./invertResetRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent]
})
export class InvertResetRowComponent {
    constructor(
        private readonly isDeltaStateService: IsDeltaStateService,
        private readonly mapColorsService: MapColorsService
    ) {}

    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

    readonly isColorRangeInverted = computed(() => this.mapColors().isColorRangeInverted ?? false)
    readonly areDeltaColorsInverted = computed(() => this.mapColors().areDeltaColorsInverted ?? false)

    handleIsColorRangeInvertedChange() {
        this.mapColorsService.invertColorRange()
    }

    handleAreDeltaColorsInvertedChange() {
        this.mapColorsService.invertDeltaColors()
    }

    resetColorsKeys() {
        return this.isDeltaState()
            ? [
                  "appSettings.mapColors.positiveDelta",
                  "appSettings.mapColors.negativeDelta",
                  "appSettings.mapColors.selected",
                  "appSettings.mapColors.areDeltaColorsInverted"
              ]
            : [
                  "appSettings.mapColors.positive",
                  "appSettings.mapColors.negative",
                  "appSettings.mapColors.neutral",
                  "appSettings.mapColors.selected",
                  "appSettings.mapColors.isColorRangeInverted",
                  "dynamicSettings.colorMode"
              ]
    }
}
