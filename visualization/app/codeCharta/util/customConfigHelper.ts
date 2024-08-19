import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import {
    CustomConfig,
    CustomConfigMapSelectionMode,
    CustomConfigsDownloadFile,
    ExportCustomConfig,
    MapNamesByChecksum
} from "../model/customConfig/customConfig.api.model"
import { FileNameHelper } from "./fileNameHelper"
import { FileDownloader } from "./fileDownloader"
import { ThreeCameraService } from "../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../ui/codeMap/threeViewer/threeMapControls.service"
import { BehaviorSubject } from "rxjs"
import { VisibleFilesBySelectionMode } from "../ui/customConfigs/visibleFilesBySelectionMode.selector"
import { Store } from "@ngrx/store"
import { setState } from "../state/store/state.actions"

export const CUSTOM_CONFIG_FILE_EXTENSION = ".cc.config.json"
const CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION = "1.0.1"
const CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION = "1.0.1"
export const CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customConfigs"

export class CustomConfigHelper {
    private static customConfigs: Map<string, CustomConfig> = CustomConfigHelper.loadCustomConfigsFromLocalStorage()
    static customConfigChange$: BehaviorSubject<null> = new BehaviorSubject(null)

    static setCustomConfigsToLocalStorage() {
        const newLocalStorageElement: LocalStorageCustomConfigs = {
            version: CUSTOM_CONFIGS_LOCAL_STORAGE_VERSION,
            customConfigs: [...CustomConfigHelper.customConfigs]
        }

        localStorage.setItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement, stateObjectReplacer))
        CustomConfigHelper.customConfigChange$.next(null)
    }

    static loadCustomConfigsFromLocalStorage() {
        const ccLocalStorage = this.getCcLocalStorage()
        return new Map(ccLocalStorage?.customConfigs)
    }

    private static getCcLocalStorage() {
        const ccLocalStorage: LocalStorageCustomConfigs = JSON.parse(
            localStorage.getItem(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT),
            stateObjectReviver
        )

        return ccLocalStorage
    }
    static addCustomConfig(newCustomConfig: CustomConfig) {
        CustomConfigHelper.customConfigs.set(newCustomConfig.id, newCustomConfig)
        CustomConfigHelper.setCustomConfigsToLocalStorage()
    }

    static editCustomConfigNote(configId: string, configNote: string) {
        const config = CustomConfigHelper.customConfigs.get(configId)
        config.note = configNote
        CustomConfigHelper.customConfigs.set(configId, config)
        CustomConfigHelper.setCustomConfigsToLocalStorage()
    }

    static getCustomConfigSettings(configId: string): CustomConfig | undefined {
        return CustomConfigHelper.customConfigs.get(configId)
    }

    static hasCustomConfigByName(
        mapSelectionMode: CustomConfigMapSelectionMode,
        assignedMaps: MapNamesByChecksum,
        configName: string
    ): boolean {
        for (const customConfig of CustomConfigHelper.customConfigs.values()) {
            if (
                customConfig.name === configName &&
                customConfig.mapSelectionMode === mapSelectionMode &&
                this.areEqual(assignedMaps, customConfig.assignedMaps)
            ) {
                return true
            }
        }

        return false
    }

    private static areEqual(map1: MapNamesByChecksum, map2: MapNamesByChecksum) {
        if (map1.size !== map2.size) {
            return false
        }
        return [...map1.entries()].every(([checksum, mapName]) => map2.has(checksum) && map2.get(checksum) === mapName)
    }

    static getCustomConfigs(): Map<string, CustomConfig> {
        return CustomConfigHelper.customConfigs
    }

    static importCustomConfigs(content: string) {
        const importedCustomConfigsFile: CustomConfigsDownloadFile = JSON.parse(content, stateObjectReviver)

        for (const exportedConfig of importedCustomConfigsFile.customConfigs.values()) {
            const alreadyExistingConfig = CustomConfigHelper.getCustomConfigSettings(exportedConfig.id)

            // Check for a duplicate Config by matching checksums
            if (alreadyExistingConfig) {
                continue
            }

            // Prevent different Configs with the same name
            if (
                CustomConfigHelper.hasCustomConfigByName(exportedConfig.mapSelectionMode, exportedConfig.assignedMaps, exportedConfig.name)
            ) {
                exportedConfig.name += ` (${FileNameHelper.getFormattedTimestamp(new Date(exportedConfig.creationTime))})`
            }

            const importedCustomConfig: CustomConfig = {
                id: exportedConfig.id,
                name: exportedConfig.name,
                creationTime: exportedConfig.creationTime,
                assignedMaps: exportedConfig.assignedMaps,
                customConfigVersion: exportedConfig.customConfigVersion,
                mapSelectionMode: exportedConfig.mapSelectionMode,
                stateSettings: exportedConfig.stateSettings,
                camera: exportedConfig.camera,
                ...(exportedConfig.note && { note: exportedConfig.note })
            }

            CustomConfigHelper.addCustomConfig(importedCustomConfig)
        }
    }

    static downloadCustomConfigs(customConfigs: Map<string, ExportCustomConfig>) {
        const customConfigsDownloadFile: CustomConfigsDownloadFile = {
            downloadApiVersion: CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION,
            timestamp: Date.now(),
            customConfigs
        }

        const fileName = FileNameHelper.getNewTimestamp() + CUSTOM_CONFIG_FILE_EXTENSION

        FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
    }

    static createExportCustomConfigFromConfig(customConfig: CustomConfig): ExportCustomConfig {
        return { ...customConfig }
    }

    static getCustomConfigsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomConfigMapSelectionMode): number {
        let count = 0

        for (const config of CustomConfigHelper.customConfigs.values()) {
            const configMapNames = [...config.assignedMaps.values()]
            if (configMapNames.join(" ") === mapNames && config.mapSelectionMode === mapSelectionMode) {
                count++
            }
        }

        return count
    }

    static getConfigNameSuggestionByFileState({ mapSelectionMode, assignedMaps }: VisibleFilesBySelectionMode): string {
        const suggestedConfigName = [...assignedMaps.values()].join(" ")
        const customConfigNumberSuffix = CustomConfigHelper.getCustomConfigsAmountByMapAndMode(suggestedConfigName, mapSelectionMode) + 1

        return `${suggestedConfigName} #${customConfigNumberSuffix}`
    }

    static deleteCustomConfigs(customConfigs: CustomConfig[]) {
        for (const customConfig of customConfigs) {
            CustomConfigHelper.customConfigs.delete(customConfig.id)
        }

        CustomConfigHelper.setCustomConfigsToLocalStorage()
    }

    static deleteCustomConfig(configId: string) {
        CustomConfigHelper.customConfigs.delete(configId)
        CustomConfigHelper.setCustomConfigsToLocalStorage()
    }

    static sortCustomConfigDropDownGroupList(a: CustomConfigItemGroup, b: CustomConfigItemGroup) {
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

    static applyCustomConfig(
        configId: string,
        store: Store,
        threeCameraService: ThreeCameraService,
        threeOrbitControlsService: ThreeMapControlsService
    ) {
        const customConfig = this.getCustomConfigSettings(configId)
        store.dispatch(setState({ value: customConfig.stateSettings }))

        // TODO: remove this dirty timeout and set camera settings properly
        // This timeout is a chance that CustomConfigs for a small map can be restored and applied completely (even the camera positions)
        if (customConfig.camera) {
            setTimeout(() => {
                threeOrbitControlsService.setControlTarget(customConfig.camera.cameraTarget)
                threeCameraService.setPosition(customConfig.camera.camera)
            }, 100)
        }
    }
}
