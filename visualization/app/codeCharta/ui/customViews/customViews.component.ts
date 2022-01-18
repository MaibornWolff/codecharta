import "./customViews.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { CustomViewHelper } from "../../util/customViewHelper"
import { StoreService } from "../../state/store.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { FileState } from "../../model/files/files"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { CustomViewFileStateConnector } from "./customViewFileStateConnector"
import { CustomView, CustomViewMapSelectionMode, ExportCustomView } from "../../model/customView/customView.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

export interface CustomViewItem {
	id: string
	name: string
	mapNames: string
	mapSelectionMode: CustomViewMapSelectionMode
	isApplicable: boolean
}

export interface CustomViewItemGroup {
	mapNames: string
	mapSelectionMode: CustomViewMapSelectionMode
	hasApplicableItems: boolean
	customViewItems: CustomViewItem[]
}

export class CustomViewsController implements FilesSelectionSubscriber {
	private _viewModel: {
		dropDownCustomViewItemGroups: CustomViewItemGroup[]
		hasDownloadableViews: boolean
		showNonApplicableButton: boolean
		visibleEntries: number
	} = {
		dropDownCustomViewItemGroups: [],
		hasDownloadableViews: false,
		showNonApplicableButton: false,
		visibleEntries: 0
	}

	private customViewFileStateConnector: CustomViewFileStateConnector
	private downloadableViews: Map<string, ExportCustomView> = new Map()
	private previousEntries
	private applicableEntries = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private dialogService: DialogService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService
	) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customViewFileStateConnector = new CustomViewFileStateConnector(files)

		this.preloadDownloadableViews()
	}

	initView() {
		this.loadCustomViews()
		this.preloadDownloadableViews()
		this.initVisibleEntries()
	}

	loadCustomViews() {
		const customViewItemGroups = CustomViewHelper.getCustomViewItemGroups(this.customViewFileStateConnector)

		this._viewModel.dropDownCustomViewItemGroups = [...customViewItemGroups.values()]
		this._viewModel.dropDownCustomViewItemGroups.sort(CustomViewHelper.sortCustomViewDropDownGroupList)
	}

	showAddCustomViewSettings() {
		this.dialogService.showAddCustomViewSettings()
	}

	applyCustomView(viewId: string) {
		CustomViewHelper.applyCustomView(viewId, this.storeService, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomView(viewId, customViewItemIndex, dropDownCustomViewItemGroupIndex) {
		const { dropDownCustomViewItemGroups } = this._viewModel

		CustomViewHelper.deleteCustomView(viewId)
		dropDownCustomViewItemGroups[dropDownCustomViewItemGroupIndex].customViewItems.splice(customViewItemIndex, 1)

		if (dropDownCustomViewItemGroups[dropDownCustomViewItemGroupIndex].customViewItems.length === 0) {
			if (dropDownCustomViewItemGroups[dropDownCustomViewItemGroupIndex].hasApplicableItems) {
				this.applicableEntries--
			}

			dropDownCustomViewItemGroups.splice(dropDownCustomViewItemGroupIndex, 1)
			this._viewModel.visibleEntries--
			this.previousEntries--
			this.updateButtonVisibility()
		}
	}

	private initVisibleEntries() {
		this.applicableEntries = 0
		while (this._viewModel.dropDownCustomViewItemGroups[this.applicableEntries]?.hasApplicableItems) {
			this.applicableEntries++
		}

		this._viewModel.visibleEntries = this.applicableEntries
		this.updateButtonVisibility()
	}

	toggleNonApplicableItems() {
		if (!this.isExpanded()) {
			this.previousEntries = this._viewModel.visibleEntries
			this._viewModel.visibleEntries = this._viewModel.dropDownCustomViewItemGroups.length
		} else {
			this._viewModel.visibleEntries = this.previousEntries
		}
	}

	downloadPreloadedCustomViews() {
		if (this.downloadableViews.size === 0) {
			return
		}

		CustomViewHelper.downloadCustomViews(this.downloadableViews, this.customViewFileStateConnector)
	}

	private preloadDownloadableViews() {
		this.downloadableViews.clear()
		const customViews = CustomViewHelper.getCustomViews()

		for (const [key, value] of customViews.entries()) {
			// Only Views which are applicable for at least one of the uploaded maps should be downloaded.
			if (this.isViewApplicableForUploadedMaps(value)) {
				this.downloadableViews.set(key, CustomViewHelper.createExportCustomViewFromView(value))
			}
		}

		this._viewModel.hasDownloadableViews = this.downloadableViews.size > 0
	}

	private isViewApplicableForUploadedMaps(customView: CustomView) {
		const mapChecksumsOfView = customView.mapChecksum.split(";")
		for (const checksumOfView of mapChecksumsOfView) {
			if (this.customViewFileStateConnector.isMapAssigned(checksumOfView)) {
				return true
			}
		}
		return false
	}

	private isExpanded(): boolean {
		return this._viewModel.visibleEntries === this._viewModel.dropDownCustomViewItemGroups.length
	}

	private updateButtonVisibility() {
		if (this._viewModel.dropDownCustomViewItemGroups.length === 0) {
			this._viewModel.showNonApplicableButton = false
		} else if (this.applicableEntries < this._viewModel.dropDownCustomViewItemGroups.length) {
			this._viewModel.showNonApplicableButton = true
		} else {
			this._viewModel.showNonApplicableButton = false
		}
	}
}

export const customViewsComponent = {
	selector: "customViewsComponent",
	template: require("./customViews.component.html"),
	controller: CustomViewsController
}
