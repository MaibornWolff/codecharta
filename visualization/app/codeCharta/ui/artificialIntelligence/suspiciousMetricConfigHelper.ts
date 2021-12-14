"use strict"

import { ColorRange, LocalStorageSuspiciousMetricConfigs, stateObjectReplacer, stateObjectReviver } from "../../codeCharta.model"
import { CodeChartaStorage } from "../../util/codeChartaStorage"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { setCamera } from "../../state/store/appSettings/camera/camera.actions"
import { setCameraTarget } from "../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { Vector3 } from "three"
import { SuspiciousMetricConfig } from "./suspiciousMetricConfig.api.model"

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

	static getSuspiciousMetricConfigs(): Map<string, SuspiciousMetricConfig> {
		return SuspiciousMetricConfigHelper.suspiciousMetricConfigs
	}

	static applySuspiciousMetricConfig(
		configId: string,
		storeService: StoreService,
		threeCameraService: ThreeCameraService,
		threeOrbitControlsService: ThreeOrbitControlsService
	) {
		const suspiciousMetricConfig = this.getSuspiciousMetricConfigSettings(configId)

		// TODO: Setting state from loaded SuspiciousMetricConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		storeService.dispatch(setState(suspiciousMetricConfig.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		storeService.dispatch(setColorRange(suspiciousMetricConfig.stateSettings.dynamicSettings.colorRange as ColorRange))
		storeService.dispatch(setMargin(suspiciousMetricConfig.stateSettings.dynamicSettings.margin))

		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that CustomConfigs for a small map can be restored and applied completely (even the camera positions)
		setTimeout(() => {
			threeCameraService.setPosition()
			threeOrbitControlsService.setControlTarget()

			storeService.dispatch(setCamera(suspiciousMetricConfig.stateSettings.appSettings.camera as Vector3))
			storeService.dispatch(setCameraTarget(suspiciousMetricConfig.stateSettings.appSettings.cameraTarget as Vector3))
		}, 100)
	}
}
