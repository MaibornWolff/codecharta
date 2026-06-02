import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setInvertHeight } from "../../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { invertHeightSelector } from "../../../../state/store/appSettings/invertHeight/invertHeight.selector"
import { setScaling } from "../../../../state/store/appSettings/scaling/scaling.actions"
import { scalingSelector } from "../../../../state/store/appSettings/scaling/scaling.selector"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { debounce } from "../../../../util/debounce"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
import { SETTINGS_INPUT_DEBOUNCE_MS, parseChangedNumberInput } from "../../util/settingsInput"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"

@Component({
    selector: "cc-height-settings-popover",
    templateUrl: "./heightSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent]
})
export class HeightSettingsPopoverComponent {
    private readonly store = inject(Store<CcState>)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly scalingY = toSignal(this.store.select(scalingSelector), { initialValue: { x: 1, y: 1, z: 1 } })
    readonly invertHeight = toSignal(this.store.select(invertHeightSelector), { initialValue: false })
    readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { initialValue: false })

    readonly resetKeys = ["appSettings.scaling.y", "appSettings.invertHeight"]

    private readonly applyDebouncedScalingY = debounce((y: number) => {
        this.store.dispatch(setScaling({ value: { y } }))
    }, SETTINGS_INPUT_DEBOUNCE_MS)

    handleScalingInput(event: Event) {
        const value = parseChangedNumberInput(event, 1, 25, this.scalingY().y)
        if (value === undefined) {
            return
        }
        this.applyDebouncedScalingY(value)
    }

    toggleInvertHeight(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.store.dispatch(setInvertHeight({ value: checked }))
    }
}
