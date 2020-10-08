import "./dialog.component.scss"
import {CustomViewHelper} from "../../util/customViewHelper";
import {StoreService} from "../../state/store.service";
import {DialogService} from "./dialog.service";
import {FilesSelectionSubscriber, FilesService} from "../../state/store/files/files.service";
import {FileSelectionState, FileState} from "../../model/files/files";
import {IRootScopeService} from "angular";

export class DialogAddCustomViewSettingsComponent implements FilesSelectionSubscriber{
	private _viewModel: {
		customViewName: string
		addInfoMessage: string
	} = {
		customViewName: "",
		addInfoMessage: ""
	}

	private nameOfSelectedMapFile: string

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
		this.nameOfSelectedMapFile = files.find(
			fileItem => fileItem.selectedAs === FileSelectionState.Single
		).file.fileMeta.fileName

		this._viewModel.customViewName = CustomViewHelper.getViewNameSuggestionByMapName(this.nameOfSelectedMapFile)
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
