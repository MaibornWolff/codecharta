import "./resetSettingsButton.component.scss"
import { setState } from "../../state/store/state.actions"
import { getPartialDefaultState } from "./getPartialDefaultState"
import { Component, Inject, Input } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"

@Component({
	selector: "cc-reset-settings-button",
	template: require("./resetSettingsButton.component.html")
})
export class ResetSettingsButtonComponent {
	@Input() settingsKeys: string[]
	@Input() tooltip?: string
	@Input() label?: string
	@Input() callback?: () => void

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State) {}

	applyDefaultSettings() {
		const partialDefaultState = getPartialDefaultState(this.settingsKeys, this.state.getValue())
		this.store.dispatch(setState(partialDefaultState))

		if (this.callback) {
			this.callback()
		}
	}
}
