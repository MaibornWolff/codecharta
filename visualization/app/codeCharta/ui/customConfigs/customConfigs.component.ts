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
		paginationLimit: number
	} = {
		dropDownCustomConfigItemGroups: [],
		hasDownloadableConfigs: false,
		paginationLimit: 1
	}

	private customConfigFileStateConnector: CustomConfigFileStateConnector
	private downloadableConfigs: Map<string, ExportCustomConfig> = new Map()

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

	removeCustomConfig(configId) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}

	showMoreItems() {
		const itemGroupsLength = this._viewModel.dropDownCustomConfigItemGroups.length
		const paginationLimit = this._viewModel.paginationLimit
		this._viewModel.paginationLimit = paginationLimit + 10 >= itemGroupsLength ? itemGroupsLength : paginationLimit + 10
	}

	showLessItems() {
		this._viewModel.paginationLimit = this._viewModel.paginationLimit <= 10 ? 1 : this._viewModel.paginationLimit - 10
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
}

export const customConfigsComponent = {
	selector: "customConfigsComponent",
	template: require("./customConfigs.component.html"),
	controller: CustomConfigsController
}
