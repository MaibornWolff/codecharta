import { getDownloadableCustomConfigs } from "./getDownloadableCustomConfigs"
import { FILE_STATES_JAVA } from "../../../util/dataMocks"
import { CustomConfig, CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"

describe("getDownloadableCustomConfigs", () => {
	it("should get an empty map when file state is undefined", () => {
		const actualDownloadableCustomConfigs = getDownloadableCustomConfigs(undefined)

		expect(actualDownloadableCustomConfigs.size).toBe(0)
	})

	it("should get an empty map when no applicable custom configs are available", () => {
		const customConfigStub = {
			id: "invalid-md5-checksum",
			name: "stubbedConfig2",
			mapChecksum: "invalid-md5-checksum",
			mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
			assignedMaps: ["test.cc.json"],
			stateSettings: {}
		} as CustomConfig
		CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map([["invalid-md5-checksum", customConfigStub]]))
		const actualDownloadableCustomConfigs = getDownloadableCustomConfigs(FILE_STATES_JAVA)

		expect(actualDownloadableCustomConfigs.size).toBe(0)
	})

	it("should get a map with downloadable custom configs when no applicable custom configs are available", () => {
		const customConfigStub = {
			id: "md5-fileB",
			name: "stubbedConfig2",
			mapChecksum: "md5-fileB",
			mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
			assignedMaps: ["test.cc.json"],
			stateSettings: {}
		} as CustomConfig
		CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map([["md5-fileB", customConfigStub]]))
		const actualDownloadableCustomConfigs = getDownloadableCustomConfigs(FILE_STATES_JAVA)

		expect(actualDownloadableCustomConfigs.size).toBe(1)
	})
})
