import "./dialog.component.scss"
import { CustomViewHelper } from "../../util/customViewHelper"
import { StoreService } from "../../state/store.service"
import { DialogService } from "./dialog.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { CustomViewFileStateConnector } from "../customViews/customViewFileStateConnector"

export class DialogAddCustomViewSettingsComponent implements FilesSelectionSubscriber {
	private _viewModel: {
		customViewName: string
		addInfoMessage: string
	} = {
		customViewName: "",
		addInfoMessage: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $mdDialog,
		private storeService: StoreService,
		private dialogService: DialogService
	) {
		FilesService.subscribe(this.$rootScope, this)
		this.onFilesSelectionChanged(this.storeService.getState().files)
	}

	onFilesSelectionChanged(files: FileState[]) {
		const customViewFileStateConnector = new CustomViewFileStateConnector(files)

		// Provide a new suggestion for the CustomView name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomView.
		this._viewModel.customViewName = CustomViewHelper.getViewNameSuggestionByFileState(customViewFileStateConnector)
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
			this.dialogService.showErrorDialog(`Could not save your Custom View: ${error}`)
		}

		this.hide()
	}

	validateCustomViewName() {
		if (CustomViewHelper.hasCustomView(this._viewModel.customViewName)) {
			this._viewModel.addInfoMessage =
				'<i class="fa fa-warning"></i> Are you sure to override? A Custom View with this name already exists.'
		} else {
			this._viewModel.addInfoMessage = ""
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
