import { Component, ViewEncapsulation } from "@angular/core"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"
import { Store } from "../../../state/angular-redux/store"
import { setPresentationMode } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { isPresentationModeSelector } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector"

@Component({
	selector: "cc-presentation-mode-button",
	templateUrl: "./presentationModeButton.component.html",
	styleUrls: ["./presentationModeButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class PresentationModeButtonComponent {
	isPresentationModeEnabled$ = this.store.select(isPresentationModeSelector)

	constructor(private readonly store: Store) {}

	setPresentationModeEnabled(event: MatSlideToggleChange) {
		this.store.dispatch(setPresentationMode(event.checked))
	}
}
