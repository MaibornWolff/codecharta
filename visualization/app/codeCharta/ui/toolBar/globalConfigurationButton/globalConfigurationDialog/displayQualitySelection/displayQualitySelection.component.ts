import { Component, ViewEncapsulation } from "@angular/core"
import { MatLegacySelectChange as MatSelectChange } from "@angular/material/legacy-select"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { Store } from "../../../../../state/angular-redux/store"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { sharpnessModeSelector } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"

@Component({
	selector: "cc-display-quality-selection",
	templateUrl: "./displayQualitySelection.component.html",
	encapsulation: ViewEncapsulation.None
})
export class DisplayQualitySelectionComponent {
	sharpnessModes = Object.values(SharpnessMode)
	sharpnessMode$ = this.store.select(sharpnessModeSelector)

	constructor(private store: Store) {}

	handleSelectedSharpnessModeChanged(event: MatSelectChange) {
		this.store.dispatch(setSharpnessMode(event.value))
	}
}
