import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { debounce } from "../../../../util/debounce"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
import { EnableFloorLabelsService } from "../../services/enableFloorLabels.service"
import { InvertAreaService } from "../../services/invertArea.service"
import { MarginService } from "../../services/margin.service"
import { SETTINGS_INPUT_DEBOUNCE_MS, parseChangedNumberInput } from "../../util/settingsInput"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"

@Component({
    selector: "cc-area-settings-popover",
    templateUrl: "./areaSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent]
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

    readonly resetKeys = ["dynamicSettings.margin", "appSettings.invertArea", "appSettings.enableFloorLabels"]

    private readonly applyDebouncedMargin = debounce((margin: number) => {
        this.marginService.setMargin(margin)
    }, SETTINGS_INPUT_DEBOUNCE_MS)

    handleMarginInput(event: Event) {
        const value = parseChangedNumberInput(event, 1, 100, this.margin())
        if (value === undefined) {
            return
        }
        this.applyDebouncedMargin(value)
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
