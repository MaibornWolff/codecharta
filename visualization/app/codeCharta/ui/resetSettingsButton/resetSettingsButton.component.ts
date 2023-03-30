// import { setState } from "../../state/store/state.actions"
import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store, State as StateService } from "@ngrx/store"
import { State } from "../../codeCharta.model"

@Component({
	selector: "cc-reset-settings-button",
	templateUrl: "./resetSettingsButton.component.html",
	styleUrls: ["./resetSettingsButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ResetSettingsButtonComponent {
	@Input() settingsKeys: string[]
	@Input() tooltip?: string
	@Input() label?: string
	@Input() callback?: () => void

	constructor(private store: Store<State>, private state: StateService<State>) {}

	applyDefaultSettings() {
		// TODO setState
		// const partialDefaultState = getPartialDefaultState(this.settingsKeys, this.state.getValue())
		// this.store.dispatch(setState(partialDefaultState))

		if (this.callback) {
			this.callback()
		}
	}
}
