import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store, State as StateService } from "@ngrx/store"
import { State } from "../../codeCharta.model"
import { getPartialDefaultState } from "./getPartialDefaultState"
import { setState } from "../../state/store/state.actions"

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
		const partialDefaultState = getPartialDefaultState(this.settingsKeys, this.state.getValue())
		this.store.dispatch(setState({ value: partialDefaultState }))

		if (this.callback) {
			this.callback()
		}
	}
}
