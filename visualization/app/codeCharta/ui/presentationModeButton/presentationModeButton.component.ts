import "./presentationModeButton.component.scss"
import { StoreService } from "../../state/store.service"
import { setPresentationMode } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import {
	IsPresentationModeService,
	IsPresentationModeSubscriber
} from "../../state/store/appSettings/isPresentationMode/isPresentationMode.service"
import { IRootScopeService } from "angular"

export class PresentationModeButtonController implements IsPresentationModeSubscriber {
	private _viewModel: {
		isEnabled: boolean
	} = {
		isEnabled: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		IsPresentationModeService.subscribe(this.$rootScope, this)
	}

	public onPresentationModeChanged(isPresentationMode: boolean) {
		this._viewModel.isEnabled = isPresentationMode
	}

	public toggleMode() {
		this.storeService.dispatch(setPresentationMode(!this._viewModel.isEnabled))
	}
}

export const presentationModeButtonComponent = {
	selector: "presentationModeButtonComponent",
	template: require("./presentationModeButton.component.html"),
	controller: PresentationModeButtonController
}
