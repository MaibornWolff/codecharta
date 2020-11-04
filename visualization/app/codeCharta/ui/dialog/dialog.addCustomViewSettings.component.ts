import "./dialog.component.scss"
import { CustomViewHelper } from "../../util/customViewHelper"
import { StoreService } from "../../state/store.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { CustomViewFileStateConnector } from "../customViews/customViewFileStateConnector"
import { buildCustomViewFromState } from "../../util/customViewBuilder";

export class DialogAddCustomViewSettingsComponent implements FilesSelectionSubscriber {
	private customViewFileStateConnector: CustomViewFileStateConnector

	private _viewModel: {
		customViewName: string
		addWarningMessage: string
	} = {
		customViewName: "",
		addWarningMessage: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $mdDialog,
		private storeService: StoreService
	) {
		FilesService.subscribe(this.$rootScope, this)
		this.onFilesSelectionChanged(this.storeService.getState().files)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customViewFileStateConnector = new CustomViewFileStateConnector(files)

		// Provide a new suggestion for the CustomView name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomView.
		this._viewModel.customViewName = CustomViewHelper.getViewNameSuggestionByFileState(this.customViewFileStateConnector)
		this.validateCustomViewName()
	}

	hide() {
		this.$mdDialog.hide()
	}

	addCustomView() {
		const newCustomView = buildCustomViewFromState(
			this._viewModel.customViewName,
			this.storeService.getState()
		)

		CustomViewHelper.addCustomView(newCustomView)

		this.hide()
	}

	validateCustomViewName() {
		if (CustomViewHelper.hasCustomView(
			this.customViewFileStateConnector.getMapSelectionMode(),
			this.customViewFileStateConnector.getSelectedMaps(),
			this._viewModel.customViewName)
		) {
			this._viewModel.addWarningMessage =
				'<i class="fa fa-warning"></i> A Custom View with this name already exists.'
		} else {
			this._viewModel.addWarningMessage = ""
		}
	}

	isNewCustomViewValid() {
		return this._viewModel.customViewName !== "" && !this._viewModel.addWarningMessage
	}
}

export const addCustomViewSettingsComponent = {
	selector: "addCustomViewSettingsComponent",
	template: require("./dialog.addCustomViewSettings.component.html"),
	controller: DialogAddCustomViewSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
