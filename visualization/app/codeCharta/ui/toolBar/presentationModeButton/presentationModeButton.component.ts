import { Component, Inject } from "@angular/core"
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { Store } from "../../../state/angular-redux/store";
import { setPresentationMode } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.actions";
import { isPresentationModeSelector } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector";
import "./presentationModeButton.component.scss"

@Component({
	selector: "cc-presentation-mode-button",
	template: require("./presentationModeButton.component.html")
})
export class PresentationModeButtonComponent {
  isPresentationModeEnabled$ = this.store.select(isPresentationModeSelector)

	constructor(@Inject(Store) private readonly store: Store) {
		// DO NOTHING
	}

  setPresentationModeEnabled(event: MatSlideToggleChange) {
    debugger 
    this.store.dispatch(setPresentationMode(event.checked))
  }
}
