"use strict"
import { State, stateObjectReplacer } from "../codeCharta.model"
import { CustomConfig } from "../model/customConfig/customConfig.api.model"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import md5 from "md5"

const CUSTOM_CONFIG_API_VERSION = "1.0.0"

export function buildCustomConfigFromState(configName: string, state: State, camera: CustomConfig["camera"]): CustomConfig {
	const customConfigFileStateConnector = new CustomConfigFileStateConnector(state.files)

	const customConfig: CustomConfig = {
		id: "",
		name: configName,
		creationTime: Date.now(),
		mapSelectionMode: customConfigFileStateConnector.getMapSelectionMode(),
		assignedMaps: customConfigFileStateConnector.getSelectedMaps(),
		mapChecksum: customConfigFileStateConnector.getChecksumOfAssignedMaps(),
		customConfigVersion: CUSTOM_CONFIG_API_VERSION,
		stateSettings: {
			appSettings: { ...state.appSettings },
			dynamicSettings: { ...state.dynamicSettings },
			fileSettings: { ...state.fileSettings },
			treeMap: { ...state.treeMap }
		},
		camera
	}

	customConfig.id = md5(JSON.stringify(customConfig, stateObjectReplacer))
	return customConfig
}
