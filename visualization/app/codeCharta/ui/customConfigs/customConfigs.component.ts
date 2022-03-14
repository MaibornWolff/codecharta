import "./customConfigs.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { FileState } from "../../model/files/files"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { CustomConfigFileStateConnector } from "./customConfigFileStateConnector"
import { CustomConfig, CustomConfigMapSelectionMode, ExportCustomConfig } from "../../model/customConfig/customConfig.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

export interface CustomConfigItem {
	id: string
	name: string
	mapNames: string
	mapSelectionMode: CustomConfigMapSelectionMode
	isApplicable: boolean
}

export interface CustomConfigItemGroup {
	mapNames: string
	mapSelectionMode: CustomConfigMapSelectionMode
	hasApplicableItems: boolean
	customConfigItems: CustomConfigItem[]
}

export class CustomConfigsController implements FilesSelectionSubscriber {
	private _viewModel: {
		dropDownCustomConfigItemGroups: CustomConfigItemGroup[]
		hasDownloadableConfigs: boolean
		showNonApplicableButton: boolean
		visibleEntries: number
	} = {
		dropDownCustomConfigItemGroups: [],
		hasDownloadableConfigs: false,
		showNonApplicableButton: false,
		visibleEntries: 0
	}

	private customConfigFileStateConnector: CustomConfigFileStateConnector
	private downloadableConfigs: Map<string, ExportCustomConfig> = new Map()
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
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)

		this.preloadDownloadableConfigs()
	}

	initView() {
		this.loadCustomConfigs()
		this.preloadDownloadableConfigs()
		this.initVisibleEntries()
	}

	loadCustomConfigs() {
		const customConfigItemGroups = CustomConfigHelper.getCustomConfigItemGroups(this.customConfigFileStateConnector)

		this._viewModel.dropDownCustomConfigItemGroups = [...customConfigItemGroups.values()]
		this._viewModel.dropDownCustomConfigItemGroups.sort(CustomConfigHelper.sortCustomConfigDropDownGroupList)
	}

	showAddCustomConfigSettings() {
		this.dialogService.showAddCustomConfigSettings()
	}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.storeService, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomConfig(configId, customConfigItemIndex, dropDownCustomConfigItemGroupIndex) {
		const { dropDownCustomConfigItemGroups } = this._viewModel

		CustomConfigHelper.deleteCustomConfig(configId)
		dropDownCustomConfigItemGroups[dropDownCustomConfigItemGroupIndex].customConfigItems.splice(customConfigItemIndex, 1)

		if (dropDownCustomConfigItemGroups[dropDownCustomConfigItemGroupIndex].customConfigItems.length === 0) {
			if (dropDownCustomConfigItemGroups[dropDownCustomConfigItemGroupIndex].hasApplicableItems) {
				this.applicableEntries--
			}

			dropDownCustomConfigItemGroups.splice(dropDownCustomConfigItemGroupIndex, 1)
			this._viewModel.visibleEntries--
			this.previousEntries--
			this.updateButtonVisibility()
		}
	}

	private initVisibleEntries() {
		this.applicableEntries = 0
		while (this._viewModel.dropDownCustomConfigItemGroups[this.applicableEntries]?.hasApplicableItems) {
			this.applicableEntries++
		}

		this._viewModel.visibleEntries = this.applicableEntries
		this.updateButtonVisibility()
	}

	toggleNonApplicableItems() {
		if (!this.isExpanded()) {
			this.previousEntries = this._viewModel.visibleEntries
			this._viewModel.visibleEntries = this._viewModel.dropDownCustomConfigItemGroups.length
		} else {
			this._viewModel.visibleEntries = this.previousEntries
		}
	}

	downloadPreloadedCustomConfigs() {
		if (this.downloadableConfigs.size === 0) {
			return
		}

		CustomConfigHelper.downloadCustomConfigs(this.downloadableConfigs, this.customConfigFileStateConnector)
	}

	private preloadDownloadableConfigs() {
		this.downloadableConfigs.clear()
		const customConfigs = CustomConfigHelper.getCustomConfigs()

		for (const [key, value] of customConfigs.entries()) {
			// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
			if (this.isConfigApplicableForUploadedMaps(value)) {
				this.downloadableConfigs.set(key, CustomConfigHelper.createExportCustomConfigFromConfig(value))
			}
		}

		this._viewModel.hasDownloadableConfigs = this.downloadableConfigs.size > 0
	}

	private isConfigApplicableForUploadedMaps(customConfig: CustomConfig) {
		const mapChecksumsOfConfig = customConfig.mapChecksum.split(";")
		for (const checksumOfConfig of mapChecksumsOfConfig) {
			if (this.customConfigFileStateConnector.isMapAssigned(checksumOfConfig)) {
				return true
			}
		}
		return false
	}

	private isExpanded(): boolean {
		return this._viewModel.visibleEntries === this._viewModel.dropDownCustomConfigItemGroups.length
	}

	private updateButtonVisibility() {
		if (this._viewModel.dropDownCustomConfigItemGroups.length === 0) {
			this._viewModel.showNonApplicableButton = false
		} else if (this.applicableEntries < this._viewModel.dropDownCustomConfigItemGroups.length) {
			this._viewModel.showNonApplicableButton = true
		} else {
			this._viewModel.showNonApplicableButton = false
		}
	}
}

export const customConfigsComponent = {
	selector: "ccCustomConfigsComponent",
	template: require("./customConfigs.component.html"),
	controller: CustomConfigsController
}
