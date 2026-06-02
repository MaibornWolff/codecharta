import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setEnableFloorLabels } from "../../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { enableFloorLabelsSelector } from "../../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.selector"
import { setInvertArea } from "../../../../state/store/appSettings/invertArea/invertArea.actions"
import { invertAreaSelector } from "../../../../state/store/appSettings/invertArea/invertArea.selector"
import { setMargin } from "../../../../state/store/dynamicSettings/margin/margin.actions"
import { marginSelector } from "../../../../state/store/dynamicSettings/margin/margin.selector"
import { debounce } from "../../../../util/debounce"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
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
    private readonly store = inject(Store<CcState>)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly margin = toSignal(this.store.select(marginSelector), { initialValue: 0 })
    readonly enableFloorLabels = toSignal(this.store.select(enableFloorLabelsSelector), { initialValue: false })
    readonly isInvertedArea = toSignal(this.store.select(invertAreaSelector), { initialValue: false })

    readonly resetKeys = ["dynamicSettings.margin", "appSettings.invertArea", "appSettings.enableFloorLabels"]

    private readonly applyDebouncedMargin = debounce((margin: number) => {
        this.store.dispatch(setMargin({ value: margin }))
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
        this.store.dispatch(setEnableFloorLabels({ value: checked }))
    }

    toggleInvertingArea(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.store.dispatch(setInvertArea({ value: checked }))
    }
}
