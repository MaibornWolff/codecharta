import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { SharpnessMode, CcState } from "../../../../../codeCharta.model"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { sharpnessModeSelector } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"

@Component({
    selector: "cc-display-quality-selection",
    templateUrl: "./displayQualitySelection.component.html"
})
export class DisplayQualitySelectionComponent {
    sharpnessModes = Object.values(SharpnessMode)
    sharpnessMode$ = this.store.select(sharpnessModeSelector)

    constructor(private store: Store<CcState>) {}

    handleSelectedSharpnessModeChanged(event: { value: SharpnessMode }) {
        this.store.dispatch(setSharpnessMode({ value: event.value }))
    }
}
