import { IRootScopeService } from "angular"
import _ from "lodash"
import { SharpnessMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setSharpnessMode } from "../../state/store/appSettings/sharpness/sharpness.actions"
import { SharpnessModeService, SharpnessSubscriber } from "../../state/store/appSettings/sharpness/sharpness.service"
import "./sharpnessSelector.component.scss"

export class SharpnessSelectorController implements SharpnessSubscriber {
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

export const sharpnessSelectorComponent = {
	selector: "sharpnessSelectorComponent",
	template: require("./sharpnessSelector.component.html"),
	controller: SharpnessSelectorController
}
