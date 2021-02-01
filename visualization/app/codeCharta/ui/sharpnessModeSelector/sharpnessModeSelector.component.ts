import { IRootScopeService } from "angular"
import _ from "lodash"
import { SharpnessMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setSharpnessMode } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { SharpnessModeService, SharpnessModeSubscriber } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.service"
import "./sharpnessModeSelector.component.scss"

export class SharpnessModeSelectorController implements SharpnessModeSubscriber {
	private _viewModel: {
		sharpnessModes: string[]
		sharpnessMode: SharpnessMode
	} = {
		sharpnessModes: null,
		sharpnessMode: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SharpnessModeService.subscribe(this.$rootScope, this)
		this.onSharpnessModeChanged(this.storeService.getState().appSettings.sharpnessMode)
		this._viewModel.sharpnessModes = _.values(SharpnessMode)
	}

	onSharpnessModeChanged(sharpnessMode: SharpnessMode) {
		this._viewModel.sharpnessMode = sharpnessMode
	}

	applySharpnessMode() {
		this.storeService.dispatch(setSharpnessMode(this._viewModel.sharpnessMode))
	}
}

export const sharpnessModeSelectorComponent = {
	selector: "sharpnessModeSelectorComponent",
	template: require("./sharpnessModeSelector.component.html"),
	controller: SharpnessModeSelectorController
}
