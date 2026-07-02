import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ResetSettingsButtonComponent } from "../../../../features/shared/components/resetSettingsButton/resetSettingsButton.component"
import { EnableFloorLabelsService } from "../../services/enableFloorLabels.service"
import { InvertAreaService } from "../../services/invertArea.service"
import { MarginService } from "../../services/margin.service"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"

@Component({
    selector: "cc-area-settings-popover",
    templateUrl: "./areaSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class AreaSettingsPopoverComponent {
    private readonly marginService = inject(MarginService)
    private readonly enableFloorLabelsService = inject(EnableFloorLabelsService)
    private readonly invertAreaService = inject(InvertAreaService)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly margin = toSignal(this.marginService.margin$(), { initialValue: 0 })
    readonly enableFloorLabels = toSignal(this.enableFloorLabelsService.enableFloorLabels$(), { initialValue: false })
    readonly isInvertedArea = toSignal(this.invertAreaService.invertArea$(), { initialValue: false })

    readonly resetKeys = ["dynamicSettings.margin", "mapState.invertArea", "mapState.enableFloorLabels"]

    setMargin(margin: number) {
        this.marginService.setMargin(margin)
    }

    setEnableFloorLabel(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.enableFloorLabelsService.setEnableFloorLabels(checked)
    }

    toggleInvertingArea(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.invertAreaService.setInvertArea(checked)
    }
}
