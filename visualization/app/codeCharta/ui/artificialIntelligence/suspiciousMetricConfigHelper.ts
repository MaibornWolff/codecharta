"use strict"

import { ColorRange, LocalStorageSuspiciousMetricConfigs, stateObjectReplacer, stateObjectReviver } from "../../codeCharta.model"
import { CodeChartaStorage } from "../../util/codeChartaStorage"
import { StoreService } from "../../state/store.service"
import { SuspiciousMetricConfig } from "./suspiciousMetricConfig.api.model"
import { FileSelectionState } from "../../model/files/files"
import { setState } from "../../state/store/state.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { setCamera } from "../../state/store/appSettings/camera/camera.actions"
import { Vector3 } from "three"
import { setCameraTarget } from "../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export const SUSPICIOUS_METRIC_CONFIGS_LOCAL_STORAGE_VERSION = "CodeCharta::suspiciousMetricConfigs"

export class SuspiciousMetricConfigHelper {
	private static suspiciousMetricConfigs: Map<string, SuspiciousMetricConfig> = SuspiciousMetricConfigHelper.loadSuspiciousMetricConfigs()
	private static storage: Storage

	static getStorage() {
		if (SuspiciousMetricConfigHelper.storage === undefined) {
			SuspiciousMetricConfigHelper.storage = new CodeChartaStorage()
		}
		return SuspiciousMetricConfigHelper.storage
	}

	static setSuspiciousMetricConfigsToLocalStorage() {
		const newLocalStorageElement: LocalStorageSuspiciousMetricConfigs = {
			version: SUSPICIOUS_METRIC_CONFIGS_LOCAL_STORAGE_VERSION,
			suspiciousMetricConfigs: [...SuspiciousMetricConfigHelper.suspiciousMetricConfigs]
		}

		SuspiciousMetricConfigHelper.getStorage().setItem(
			SUSPICIOUS_METRIC_CONFIGS_LOCAL_STORAGE_VERSION,
			JSON.stringify(newLocalStorageElement, stateObjectReplacer)
		)
	}

	private static loadSuspiciousMetricConfigs() {
		const ccLocalStorage: LocalStorageSuspiciousMetricConfigs = JSON.parse(
			SuspiciousMetricConfigHelper.getStorage().getItem(SUSPICIOUS_METRIC_CONFIGS_LOCAL_STORAGE_VERSION),
			stateObjectReviver
		)
		return new Map(ccLocalStorage?.suspiciousMetricConfigs)
	}

	static addSuspiciousMetricConfigs(newSuspiciousMetricConfigs: SuspiciousMetricConfig[]) {
		for (const newSuspiciousMetricConfig of newSuspiciousMetricConfigs) {
			SuspiciousMetricConfigHelper.suspiciousMetricConfigs.set(newSuspiciousMetricConfig.id, newSuspiciousMetricConfig)
		}
		SuspiciousMetricConfigHelper.setSuspiciousMetricConfigsToLocalStorage()
	}

	static addSuspiciousMetricConfig(newSuspiciousMetricConfig: SuspiciousMetricConfig) {
		SuspiciousMetricConfigHelper.suspiciousMetricConfigs.set(newSuspiciousMetricConfig.id, newSuspiciousMetricConfig)
		SuspiciousMetricConfigHelper.setSuspiciousMetricConfigsToLocalStorage()
	}

	static getSuspiciousMetricConfigSettings(configId: string): SuspiciousMetricConfig | undefined {
		return SuspiciousMetricConfigHelper.suspiciousMetricConfigs.get(configId)
	}

	static getSuspiciousMetricConfigByName(
		mapSelectionMode: FileSelectionState,
		fileChecksum: string,
		metricName: string
	): SuspiciousMetricConfig | null {
		for (const suspiciousMetricConfig of SuspiciousMetricConfigHelper.suspiciousMetricConfigs.values()) {
			if (
				suspiciousMetricConfig.stateSettings.dynamicSettings.heightMetric === metricName &&
				suspiciousMetricConfig.mapSelectionMode === mapSelectionMode &&
				suspiciousMetricConfig.fileChecksum === fileChecksum
			) {
				return suspiciousMetricConfig
			}
		}

		return null
	}

	static deleteSuspiciousMetricConfig(configId: string) {
		SuspiciousMetricConfigHelper.suspiciousMetricConfigs.delete(configId)
		SuspiciousMetricConfigHelper.setSuspiciousMetricConfigsToLocalStorage()
	}

	static applySuspiciousMetricConfig(
		configId: string,
		storeService: StoreService,
		threeCameraService: ThreeCameraService,
		threeOrbitControlsService: ThreeOrbitControlsService
	) {
		const suspiciousMetrincConfig = this.getSuspiciousMetricConfigSettings(configId)

		// TODO: Setting state from loaded SusoiciousMetrincConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		storeService.dispatch(setState(suspiciousMetrincConfig.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		storeService.dispatch(setColorRange(suspiciousMetrincConfig.stateSettings.dynamicSettings.colorRange as ColorRange))
		storeService.dispatch(setMargin(suspiciousMetrincConfig.stateSettings.dynamicSettings.margin))

		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that SusoiciousMetrincConfigs for a small map can be restored and applied completely (even the camera positions)
		setTimeout(() => {
			threeCameraService.setPosition()
			threeOrbitControlsService.setControlTarget()

			storeService.dispatch(setCamera(suspiciousMetrincConfig.stateSettings.appSettings.camera as Vector3))
			storeService.dispatch(setCameraTarget(suspiciousMetrincConfig.stateSettings.appSettings.cameraTarget as Vector3))
		}, 100)
	}
}
