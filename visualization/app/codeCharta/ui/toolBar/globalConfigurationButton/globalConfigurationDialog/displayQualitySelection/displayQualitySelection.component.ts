import { Component, Inject } from "@angular/core"
import { MatSelectChange } from "@angular/material/select"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { Store } from "../../../../../state/angular-redux/store"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { sharpnessModeSelector } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"

@Component({
	selector: "cc-display-quality-selection",
	template: require("./displayQualitySelection.component.html")
})
export class DisplayQualitySelectionComponent {
	sharpnessModes = Object.values(SharpnessMode)
	sharpnessMode$ = this.store.select(sharpnessModeSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleSelectedSharpnessModeChanged(event: MatSelectChange) {
		this.store.dispatch(setSharpnessMode(event.value))
	}
}
