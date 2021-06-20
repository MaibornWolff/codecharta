import "./customConfigs.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ColorRange } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { FileState } from "../../model/files/files"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { CustomConfigFileStateConnector } from "./customConfigFileStateConnector"
import { CustomConfig, CustomConfigMapSelectionMode, ExportCustomConfig } from "../../model/customConfig/customConfig.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { setCamera } from "../../state/store/appSettings/camera/camera.actions"
import { setCameraTarget } from "../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { Vector3 } from "three"

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
	} = {
		dropDownCustomConfigItemGroups: [],
		hasDownloadableConfigs: false
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
		const customConfig = CustomConfigHelper.getCustomConfigSettings(configId)

		// TODO: Setting state from loaded CustomConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		this.storeService.dispatch(setState(customConfig.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		this.storeService.dispatch(setColorRange(customConfig.stateSettings.dynamicSettings.colorRange as ColorRange))
		this.storeService.dispatch(setMargin(customConfig.stateSettings.dynamicSettings.margin))

		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that CustomConfigs for a small map can be restored and applied completely (even the camera positions)
		setTimeout(() => {
			this.threeCameraService.setPosition()
			this.threeOrbitControlsService.setControlTarget()

			this.storeService.dispatch(setCamera(customConfig.stateSettings.appSettings.camera as Vector3))
			this.storeService.dispatch(setCameraTarget(customConfig.stateSettings.appSettings.cameraTarget as Vector3))
		}, 100)
	}

	removeCustomConfig(configId, configName) {
		CustomConfigHelper.deleteCustomConfig(configId)
		this.dialogService.showInfoDialog(`${configName} deleted.`)
	}

	downloadPreloadedCustomConfigs() {
		if (!this.downloadableConfigs.size) {
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
