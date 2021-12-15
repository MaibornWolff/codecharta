"use strict"

import { LocalStorageSuspiciousMetricConfigs, stateObjectReplacer, stateObjectReviver } from "../../codeCharta.model"
import { CodeChartaStorage } from "../../util/codeChartaStorage"
import { StoreService } from "../../state/store.service"
import { SuspiciousMetricConfig } from "./suspiciousMetricConfig.api.model"
import { FileSelectionState } from "../../model/files/files"
import { setState } from "../../state/store/state.actions"

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
			const suspiciousMetricConfig = SuspiciousMetricConfigHelper.getSuspiciousMetricConfigByName(
				newSuspiciousMetricConfig.mapSelectionMode,
				newSuspiciousMetricConfig.fileChecksum,
				newSuspiciousMetricConfig.metricName
			)

			// If it exists, create a fresh one with current thresholds
			if (suspiciousMetricConfig !== null) {
				SuspiciousMetricConfigHelper.deleteSuspiciousMetricConfig(suspiciousMetricConfig.id)
			}
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
				suspiciousMetricConfig.metricName === metricName &&
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

	static applySuspiciousMetricConfig(configId: string, storeService: StoreService) {
		const suspiciousMetricConfig = this.getSuspiciousMetricConfigSettings(configId)
		// TODO: Setting state from loaded SuspiciousMetricConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only

		storeService.dispatch(setState(suspiciousMetricConfig.stateSettings))
	}
}
