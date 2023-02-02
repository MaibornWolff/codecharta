import { setState } from "../../state/store/state.actions"
import { getPartialDefaultState } from "./getPartialDefaultState"
import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"

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

	constructor(private store: Store, private state: State) {}

	applyDefaultSettings() {
		const partialDefaultState = getPartialDefaultState(this.settingsKeys, this.state.getValue())
		this.store.dispatch(setState(partialDefaultState))

		if (this.callback) {
			this.callback()
		}
	}
}
