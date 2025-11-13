import { Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { SharpnessMode, CcState } from "../../../../../codeCharta.model"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { GlobalSettingsFacade } from "../../../../../features/globalSettings/facade"

@Component({
    selector: "cc-display-quality-selection",
    templateUrl: "./displayQualitySelection.component.html",
    imports: []
})
export class DisplayQualitySelectionComponent {
    sharpnessModes = Object.values(SharpnessMode)
    sharpnessMode = toSignal(this.globalSettingsFacade.sharpnessMode$(), { requireSync: true })

    constructor(
        private readonly store: Store<CcState>,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {}

    handleSelectedSharpnessModeChanged(event: Event) {
        const value = (event.target as HTMLSelectElement).value as SharpnessMode
        this.store.dispatch(setSharpnessMode({ value }))
    }
}
