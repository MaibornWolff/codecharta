import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store, State as StateService } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
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

	constructor(private store: Store<CcState>, private state: StateService<CcState>) {}

	applyDefaultSettings() {
		const partialDefaultState = getPartialDefaultState(this.settingsKeys, this.state.getValue())
		this.store.dispatch(setState({ value: partialDefaultState }))

		if (this.callback) {
			this.callback()
		}
	}
}
