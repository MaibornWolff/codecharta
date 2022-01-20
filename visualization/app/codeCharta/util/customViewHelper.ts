"use strict"
import {
	ColorRange,
	LocalStorageCustomConfigs,
	LocalStorageCustomViews,
	stateObjectReplacer,
	stateObjectReviver
} from "../codeCharta.model"
import { CustomViewItemGroup } from "../ui/customViews/customViews.component"
import {
	CustomConfigsDownloadFile,
	CustomView,
	CustomViewMapSelectionMode,
	CustomViewsDownloadFile,
	ExportCustomView
} from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"
import { FileNameHelper } from "./fileNameHelper"
import { FileDownloader } from "./fileDownloader"
import { setState } from "../state/store/state.actions"
import { setColorRange } from "../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMargin } from "../state/store/dynamicSettings/margin/margin.actions"
import { setCamera } from "../state/store/appSettings/camera/camera.actions"
import { Vector3 } from "three"
import { setCameraTarget } from "../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { StoreService } from "../state/store.service"
import { ThreeCameraService } from "../ui/codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../ui/codeMap/threeViewer/threeOrbitControlsService"
import { CodeChartaStorage } from "./codeChartaStorage"

export const CUSTOM_VIEW_FILE_EXTENSION = ".cc.config.json"
const CUSTOM_VIEWS_LOCAL_STORAGE_VERSION = "2.0.0"
const CUSTOM_VIEWS_DOWNLOAD_FILE_VERSION = "2.0.0"
export const CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

export class CustomViewHelper {
	private static customViews: Map<string, CustomView> = CustomViewHelper.loadCustomViews()
	private static storage: Storage

	static getStorage() {
		if (CustomViewHelper.storage === undefined) {
			CustomViewHelper.storage = new CodeChartaStorage()
		}
		return CustomViewHelper.storage
	}

	static getCustomViewItemGroups(customViewFileStateConnector: CustomViewFileStateConnector): Map<string, CustomViewItemGroup> {
		const customViewItemGroups: Map<string, CustomViewItemGroup> = new Map()

		for (const customView of CustomViewHelper.customViews.values()) {
			const groupKey = `${customView.assignedMaps.join("_")}_${customView.mapSelectionMode}`

			if (!customViewItemGroups.has(groupKey)) {
				customViewItemGroups.set(groupKey, {
					mapNames: customView.assignedMaps.join(" "),
					mapSelectionMode: customView.mapSelectionMode,
					hasApplicableItems: false,
					customViewItems: []
				})
			}

			const customViewItemApplicable = CustomViewHelper.isCustomViewApplicable(customViewFileStateConnector, customView)
			customViewItemGroups.get(groupKey).customViewItems.push({
				id: customView.id,
				name: customView.name,
				mapNames: customView.assignedMaps.join(" "),
				mapSelectionMode: customView.mapSelectionMode,
				isApplicable: customViewItemApplicable
			})

			if (customViewItemApplicable) {
				customViewItemGroups.get(groupKey).hasApplicableItems = true
			}
		}

		return customViewItemGroups
	}

	private static isCustomViewApplicable(customViewFileStateConnector: CustomViewFileStateConnector, customView: CustomView) {
		//Custom views are applicable if their mapChecksums (and mode) are matching, therefore, map names must not be checked.
		return (
			customViewFileStateConnector.getChecksumOfAssignedMaps() === customView.mapChecksum &&
			customViewFileStateConnector.getMapSelectionMode() === customView.mapSelectionMode
		)
	}

	static setCustomViewsToLocalStorage() {
		const newLocalStorageElement: LocalStorageCustomViews = {
			version: CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
			customViews: [...CustomViewHelper.customViews]
		}

		CustomViewHelper.getStorage().setItem(
			CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT,
			JSON.stringify(newLocalStorageElement, stateObjectReplacer)
		)
	}

	private static loadCustomViews() {
		const ccLocalStorage = this.getCcLocalStorage()
		return new Map(ccLocalStorage?.customViews)
	}

	private static getCcLocalStorage() {
		const ccLocalStorage: LocalStorageCustomViews | LocalStorageCustomConfigs = JSON.parse(
			CustomViewHelper.getStorage().getItem(CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT),
			stateObjectReviver
		)
		if (!ccLocalStorage) return

		if ("customConfigs" in ccLocalStorage) {
			return this.getParsedCcLocalStorageViews(ccLocalStorage)
		}
		return ccLocalStorage
	}

	private static getParsedCcLocalStorageViews(ccLocalStorage: LocalStorageCustomConfigs) {
		const parsedCcLocalStorageView: LocalStorageCustomViews = {
			version: CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
			customViews: []
		}

		for (const [id, exportedConfig] of ccLocalStorage.customConfigs.values()) {
			const importedCustomView: CustomView = {
				id: exportedConfig.id,
				name: exportedConfig.name,
				creationTime: exportedConfig.creationTime,
				assignedMaps: exportedConfig.assignedMaps,
				customViewVersion: CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
				mapChecksum: exportedConfig.mapChecksum,
				mapSelectionMode: exportedConfig.mapSelectionMode,
				stateSettings: exportedConfig.stateSettings
			}
			parsedCcLocalStorageView.customViews.push([id, importedCustomView])
		}
		this.replaceCustomConfigsWithCustomViewsInLocalStorage(parsedCcLocalStorageView)

		return parsedCcLocalStorageView
	}

	private static replaceCustomConfigsWithCustomViewsInLocalStorage(parsedCcLocalStorageView: LocalStorageCustomViews) {
		CustomViewHelper.getStorage().removeItem(CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT)
		CustomViewHelper.getStorage().setItem(CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, JSON.stringify(parsedCcLocalStorageView))
	}

	static addCustomViews(newCustomViews: CustomView[]) {
		for (const newCustomView of newCustomViews) {
			CustomViewHelper.customViews.set(newCustomView.id, newCustomView)
		}
		CustomViewHelper.setCustomViewsToLocalStorage()
	}

	static addCustomView(newCustomView: CustomView) {
		CustomViewHelper.customViews.set(newCustomView.id, newCustomView)
		CustomViewHelper.setCustomViewsToLocalStorage()
	}

	static getCustomViewSettings(customViewId: string): CustomView | undefined {
		return CustomViewHelper.customViews.get(customViewId)
	}

	static hasCustomViewByName(mapSelectionMode: CustomViewMapSelectionMode, selectedMaps: string[], customViewName: string): boolean {
		for (const customView of CustomViewHelper.customViews.values()) {
			if (
				customView.name === customViewName &&
				customView.mapSelectionMode === mapSelectionMode &&
				customView.assignedMaps.join("") === selectedMaps.join("")
			) {
				return true
			}
		}

		return false
	}

	static getCustomViewByName(
		mapSelectionMode: CustomViewMapSelectionMode,
		selectedMaps: string[],
		customViewName: string
	): CustomView | null {
		for (const customView of CustomViewHelper.customViews.values()) {
			if (
				customView.name === customViewName &&
				customView.mapSelectionMode === mapSelectionMode &&
				customView.assignedMaps.join("") === selectedMaps.join("")
			) {
				return customView
			}
		}

		return null
	}

	static getCustomViews(): Map<string, CustomView> {
		return CustomViewHelper.customViews
	}

	static importCustomViews(content: string) {
		const parsedCustomViewFile = this.getImportedCustomViewsFile(content)

		for (const exportedConfig of parsedCustomViewFile.customViews.values()) {
			const alreadyExistingConfig = CustomViewHelper.getCustomViewSettings(exportedConfig.id)

			// Check for a duplicate custom view by matching checksums
			if (alreadyExistingConfig) {
				continue
			}

			// Prevent different custom views with the same name
			if (CustomViewHelper.hasCustomViewByName(exportedConfig.mapSelectionMode, exportedConfig.assignedMaps, exportedConfig.name)) {
				exportedConfig.name += ` (${FileNameHelper.getFormattedTimestamp(new Date(exportedConfig.creationTime))})`
			}

			const importedCustomView: CustomView = {
				id: exportedConfig.id,
				name: exportedConfig.name,
				creationTime: exportedConfig.creationTime,
				assignedMaps: exportedConfig.assignedMaps,
				customViewVersion: exportedConfig.customViewVersion ? exportedConfig.customViewVersion : CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
				mapChecksum: exportedConfig.mapChecksum,
				mapSelectionMode: exportedConfig.mapSelectionMode,
				stateSettings: exportedConfig.stateSettings
			}

			CustomViewHelper.addCustomView(importedCustomView)
		}
	}

	private static getImportedCustomViewsFile(content: string) {
		const importedCustomViewsFile: CustomConfigsDownloadFile | CustomViewsDownloadFile = JSON.parse(content, stateObjectReviver)

		if ("customConfigs" in importedCustomViewsFile) {
			const parsedCustomViewFile: CustomViewsDownloadFile = {
				downloadApiVersion: CUSTOM_VIEWS_DOWNLOAD_FILE_VERSION,
				timestamp: importedCustomViewsFile.timestamp,
				customViews: importedCustomViewsFile.customConfigs
			}
			return parsedCustomViewFile
		}
		return importedCustomViewsFile
	}

	static downloadCustomViews(customViews: Map<string, ExportCustomView>, customViewFileStateConnector: CustomViewFileStateConnector) {
		const customViewsDownloadFile: CustomViewsDownloadFile = {
			downloadApiVersion: CUSTOM_VIEWS_DOWNLOAD_FILE_VERSION,
			timestamp: Date.now(),
			customViews
		}

		let fileName = FileNameHelper.getNewTimestamp() + CUSTOM_VIEW_FILE_EXTENSION

		if (
			!customViewFileStateConnector.isDeltaMode() &&
			customViewFileStateConnector.getAmountOfUploadedFiles() === 1 &&
			customViewFileStateConnector.isEachFileSelected()
		) {
			// If only one map is uploaded/present in SINGLE mode, prefix the .cc.config.json file with its name.
			fileName = `${FileNameHelper.withoutCCJsonExtension(customViewFileStateConnector.getJointMapName())}_${fileName}`
		}

		FileDownloader.downloadData(JSON.stringify(customViewsDownloadFile, stateObjectReplacer), fileName)
	}

	static createExportCustomViewFromView(customView: CustomView): ExportCustomView {
		return { ...customView }
	}

	static getCustomViewsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomViewMapSelectionMode): number {
		let count = 0

		for (const customView of CustomViewHelper.customViews.values()) {
			if (customView.assignedMaps.join(" ") === mapNames && customView.mapSelectionMode === mapSelectionMode) {
				count++
			}
		}

		return count
	}

	static getCustomViewNameSuggestionByFileState(customViewFileStateConnector: CustomViewFileStateConnector): string {
		const suggestedConfigName = customViewFileStateConnector.getJointMapName()

		if (!suggestedConfigName) {
			return ""
		}

		const customViewNumberSuffix =
			CustomViewHelper.getCustomViewsAmountByMapAndMode(
				customViewFileStateConnector.getJointMapName(),
				customViewFileStateConnector.getMapSelectionMode()
			) + 1

		return `${suggestedConfigName} #${customViewNumberSuffix}`
	}

	static deleteCustomViews(customViews: CustomView[]) {
		for (const customView of customViews) {
			CustomViewHelper.customViews.delete(customView.id)
		}

		CustomViewHelper.setCustomViewsToLocalStorage()
	}

	static deleteCustomView(customViewId: string) {
		CustomViewHelper.customViews.delete(customViewId)
		CustomViewHelper.setCustomViewsToLocalStorage()
	}

	static sortCustomViewDropDownGroupList(a: CustomViewItemGroup, b: CustomViewItemGroup) {
		if (!b.hasApplicableItems) {
			if (a.hasApplicableItems || a.mapSelectionMode < b.mapSelectionMode) {
				return -1
			}
			if (a.mapSelectionMode === b.mapSelectionMode) {
				return 0
			}
		}

		return 1
	}

	static applyCustomView(
		customViewId: string,
		storeService: StoreService,
		threeCameraService: ThreeCameraService,
		threeOrbitControlsService: ThreeOrbitControlsService
	) {
		const customView = this.getCustomViewSettings(customViewId)

		// TODO: Setting state from loaded CustomView not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		storeService.dispatch(setState(customView.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		storeService.dispatch(setColorRange(customView.stateSettings.dynamicSettings.colorRange as ColorRange))
		storeService.dispatch(setMargin(customView.stateSettings.dynamicSettings.margin))

		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that CustomViews for a small map can be restored and applied completely (even the camera positions)
		setTimeout(() => {
			threeCameraService.setPosition()
			threeOrbitControlsService.setControlTarget()

			storeService.dispatch(setCamera(customView.stateSettings.appSettings.camera as Vector3))
			storeService.dispatch(setCameraTarget(customView.stateSettings.appSettings.cameraTarget as Vector3))
		}, 100)
	}
}
