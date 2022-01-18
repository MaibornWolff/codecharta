import "./dialog.component.scss"
import { CustomViewHelper } from "../../util/customViewHelper"
import { StoreService } from "../../state/store.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { CustomViewFileStateConnector } from "../customViews/customViewFileStateConnector"
import { buildCustomViewFromState } from "../../util/customViewBuilder"
import { CustomView, ExportCustomView } from "../../model/customView/customView.api.model"
import { DialogService } from "./dialog.service"

export class DialogAddCustomViewSettingsComponent implements FilesSelectionSubscriber {
	private customViewFileStateConnector: CustomViewFileStateConnector
	private purgeableViews: Set<CustomView> = new Set()
	private customLocalStorageLimitInKB = 768
	private customViewAgeLimitInMonths = 6

	private _viewModel: {
		customViewName: string
		addErrorMessage: string
		localStorageSizeWarningMessage: string
	} = {
		customViewName: "",
		addErrorMessage: "",
		localStorageSizeWarningMessage: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $mdDialog,
		private storeService: StoreService,
		private dialogService: DialogService
	) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		this.onFilesSelectionChanged(this.storeService.getState().files)
		this.validateLocalStorageSize()
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customViewFileStateConnector = new CustomViewFileStateConnector(files)

		// Provide a new suggestion for the CustomView name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomView.
		this._viewModel.customViewName = CustomViewHelper.getCustomViewNameSuggestionByFileState(this.customViewFileStateConnector)
		this.validateCustomViewName()
	}

	hide() {
		this.$mdDialog.hide()
	}

	addCustomView() {
		const newCustomView = buildCustomViewFromState(this._viewModel.customViewName, this.storeService.getState())

		CustomViewHelper.addCustomView(newCustomView)

		this.hide()
	}

	async showPurgeConfirmDialog() {
		this.downloadAndCollectPurgeableOldViews()

		if (this.purgeableViews.size === 0) {
			await this.dialogService.showErrorDialog("Could not download and purge old views automatically! Please try it by yourself.")
			return
		}

		const confirmDialog = this.$mdDialog
			.confirm()
			.clickOutsideToClose(true)
			.title("Confirm to purge old Views")
			.htmlContent("Are you sure to delete old Views now?")
			.ok("Purge Views now!")
			.cancel("Cancel")

		try {
			await this.$mdDialog.show(confirmDialog)
			// The user has confirmed to purge old Views.
			this.purgeOldViews()
		} catch {
			// The user has cancelled the purge - do nothing.
		}
	}

	purgeOldViews() {
		if (this.purgeableViews.size === 0) {
			return
		}

		CustomViewHelper.deleteCustomViews([...this.purgeableViews])
	}

	downloadAndCollectPurgeableOldViews() {
		this.purgeableViews.clear()
		const customViews = CustomViewHelper.getCustomViews()

		const downloadableViews: Map<string, ExportCustomView> = new Map()
		const daysPerMonth = 30

		for (const [key, value] of customViews.entries()) {
			if (value?.creationTime === undefined) {
				// Fallback, if creationTime property is not present. This can happen because it was released later.
				value.creationTime = Date.now()
			}

			// Download e.g. 6 month old or older Views.
			const ageInMonth = (Date.now() - value.creationTime) / (1000 * 60 * 60 * 24 * daysPerMonth)
			if (ageInMonth < this.customViewAgeLimitInMonths) {
				continue
			}

			downloadableViews.set(key, CustomViewHelper.createExportCustomViewFromView(value))
			this.purgeableViews.add(value)
		}

		if (downloadableViews.size > 0) {
			CustomViewHelper.downloadCustomViews(downloadableViews, this.customViewFileStateConnector)
		}
	}

	validateCustomViewName() {
		this._viewModel.addErrorMessage = CustomViewHelper.hasCustomViewByName(
			this.customViewFileStateConnector.getMapSelectionMode(),
			this.customViewFileStateConnector.getSelectedMaps(),
			this._viewModel.customViewName
		)
			? "A Custom View with this name already exists."
			: ""
	}

	validateLocalStorageSize() {
		let allStringsConcatenated = ""
		for (const [key, value] of Object.entries(localStorage)) {
			allStringsConcatenated += key + value
		}

		// It does not exist a limit for the total localStorage size that applies to all browsers.
		// Usually 2MB - 10MB are available (5MB seems to be very common).
		// The localStorage size (e.g. 5MB) is assigned per origin.
		// Multiply localStorage characters by 16 (bits( because they are stored in UTF-16.
		// Add 3KB as it seems there is some default overhead.
		const localStorageSizeInKB = 3 + (allStringsConcatenated.length * 16) / 8 / 1024

		this._viewModel.localStorageSizeWarningMessage =
			localStorageSizeInKB > this.customLocalStorageLimitInKB
				? "Do you want to download and then purge old unused Views to make space for new ones?"
				: ""
	}

	isNewCustomViewValid() {
		return this._viewModel.customViewName !== "" && !this._viewModel.addErrorMessage
	}
}

export const addCustomViewSettingsComponent = {
	selector: "addCustomViewSettingsComponent",
	template: require("./dialog.addCustomViewSettings.component.html"),
	controller: DialogAddCustomViewSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
