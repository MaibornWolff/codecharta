import "./dialog.component.scss"
import {CustomViewHelper} from "../../util/customViewHelper";
import {StoreService} from "../../state/store.service";
import {DialogService} from "./dialog.service";

export class DialogAddCustomViewSettingsComponent {
	private _viewModel: {
		customViewName: string
		addInfoMessage: string
	} = {
		customViewName: "",
		addInfoMessage: ""
	}

	constructor(
		private $mdDialog,
		private storeService: StoreService,
		private dialogService: DialogService
	) {
		this._viewModel.customViewName = CustomViewHelper.getViewNameSuggestion(this.storeService.getState())
		this.validateCustomViewName()
	}

	hide() {
		this.$mdDialog.hide()
	}

	addCustomView() {
		try {
			const newCustomView = CustomViewHelper.createNewCustomView(this._viewModel.customViewName, this.storeService.getState())
			CustomViewHelper.addCustomView(newCustomView)
		} catch (error) {
			this.dialogService.showErrorDialog(`Could not save your Custom View: ${ error }`)
		}

		this.hide()
	}

	validateCustomViewName() {
		if (CustomViewHelper.hasCustomView(this._viewModel.customViewName)) {
			this._viewModel.addInfoMessage = '<i class="fa fa-warning"></i> A Custom View with this name already exists. Are you sure to override?'
		} else {
			this._viewModel.addInfoMessage = ''
		}
	}

	isNewCustomViewValid() {
		return !(this._viewModel.customViewName === "")
	}
}

export const addCustomViewSettingsComponent = {
	selector: "addCustomViewSettingsComponent",
	template: require("./dialog.addCustomViewSettings.component.html"),
	controller: DialogAddCustomViewSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
