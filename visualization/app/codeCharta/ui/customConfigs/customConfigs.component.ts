import "./customConfigs.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ColorRange, stateObjectReplacer } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { FileState } from "../../model/files/files"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { IRootScopeService } from "angular"
import { CustomConfigFileStateConnector } from "./customConfigFileStateConnector"
import {
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile,
	ExportCustomConfig
} from "../../model/customConfig/customConfig.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { setCamera } from "../../state/store/appSettings/camera/camera.actions"
import { setCameraTarget } from "../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { Vector3 } from "three"
import { FileDownloader } from "../../util/fileDownloader";
import { FileNameHelper } from "../../util/fileNameHelper";

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

const CUSTOM_CONFIG_FILE_EXTENSION = ".cc.config.json"

export class CustomConfigsController implements FilesSelectionSubscriber {
	private _viewModel: {
		dropDownCustomConfigItemGroups: CustomConfigItemGroup[],
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
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)

		this.prefetchDownloadableConfigsForUploadedMaps()
	}

	initView() {
		this.loadCustomConfigs()
		this.prefetchDownloadableConfigsForUploadedMaps()
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

	downloadPrefetchedCustomConfigs() {
		// TODO: Find duplicates on import
		// TODO: Write tests
		// TODO: we might add an input validation
		// TODO: we must handle duplicates

		if (!this.downloadableConfigs.size) {
			return
		}

		const customConfigsDownloadFile: CustomConfigsDownloadFile = {
			downloadApiVersion: "1.0.0",
			timestamp: Date.now(),
			customConfigs: this.downloadableConfigs,
		}

		let fileName = FileNameHelper.getNewTimestamp() + CUSTOM_CONFIG_FILE_EXTENSION

		if (
			!this.customConfigFileStateConnector.isDeltaMode() &&
			this.customConfigFileStateConnector.getAmountOfUploadedFiles() === 1 &&
			this.customConfigFileStateConnector.isEachFileSelected()
		) {
			// If only one map is uploaded/present in SINGLE mode, prefix the .cc.config.json file with its name.
			fileName = `${FileNameHelper.withoutCCJsonExtension(this.customConfigFileStateConnector.getJointMapName())}_${fileName}`
		}

		FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
	}

	private prefetchDownloadableConfigsForUploadedMaps() {
		const customConfigs = CustomConfigHelper.getCustomConfigs()

		for (const [key, value] of customConfigs.entries()) {
			// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
			if (!this.customConfigFileStateConnector.getChecksumOfAssignedMaps().includes(value.mapChecksum)) {
				continue
			}

			const exportCustomConfig: ExportCustomConfig = {
				assignedMaps: value.assignedMaps,
				customConfigVersion: value.customConfigVersion,
				id: value.id,
				mapChecksum: value.mapChecksum,
				mapSelectionMode: value.mapSelectionMode,
				name: value.name,
				stateSettings: value.stateSettings
			}

			this.downloadableConfigs.set(key, exportCustomConfig)
		}

		return this._viewModel.hasDownloadableConfigs = this.downloadableConfigs.size > 0
	}
}

export const customConfigsComponent = {
	selector: "customConfigsComponent",
	template: require("./customConfigs.component.html"),
	controller: CustomConfigsController
}
