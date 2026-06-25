import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ResetSettingsButtonComponent } from "../../../../features/shared/components/resetSettingsButton/resetSettingsButton.component"
import { InvertHeightService } from "../../services/invertHeight.service"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { ScalingService } from "../../services/scaling.service"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"

@Component({
    selector: "cc-height-settings-popover",
    templateUrl: "./heightSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class HeightSettingsPopoverComponent {
    private readonly scalingService = inject(ScalingService)
    private readonly invertHeightService = inject(InvertHeightService)
    private readonly isDeltaStateService = inject(IsDeltaStateService)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly scalingY = toSignal(this.scalingService.scaling$(), { initialValue: { x: 1, y: 1, z: 1 } })
    readonly invertHeight = toSignal(this.invertHeightService.invertHeight$(), { initialValue: false })
    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })

    readonly resetKeys = ["appSettings.scaling.y", "appSettings.invertHeight"]

    setScalingY(y: number) {
        this.scalingService.setScaling({ y })
    }

    toggleInvertHeight(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.invertHeightService.setInvertHeight(checked)
    }
}
