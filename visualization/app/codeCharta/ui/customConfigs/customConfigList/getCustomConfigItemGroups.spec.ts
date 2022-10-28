import { CustomConfig, CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { getCustomConfigItemGroups } from "./getCustomConfigItemGroups"

describe("getCustomConfigItemGroups", () => {
	const customConfigStub1 = {
		id: "1-invalid-md5-checksum",
		name: "config1",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: ["map1.cc.json", "map2.cc.json"],
		mapChecksum: "checksum1;checksum2"
	} as CustomConfig

	const customConfigStub2 = {
		id: "2-invalid-md5-checksum",
		name: "config2",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: ["map3.cc.json"],
		mapChecksum: "checksum3"
	} as CustomConfig

	it("should set applicable-flags to true, if assignedMap name and checksums are matching", () => {
		CustomConfigHelper.loadCustomConfigs = jest.fn().mockReturnValue(
			new Map([
				["customConfigKey_1", customConfigStub1],
				["customConfigKey_2", customConfigStub2]
			])
		)
		const fileMapCheckSumsByMapSelectionMode = new Map([[CustomConfigMapSelectionMode.MULTIPLE, ["checksum1", "checksum2"]]])

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(fileMapCheckSumsByMapSelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1.cc.json_map2.cc.json_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)

		const nonApplicableGroup = actualCustomConfigItemGroups.nonApplicableItems.get("map3.cc.json_MULTIPLE")
		expect(nonApplicableGroup.customConfigItems[0].name).toBe("config2")
		expect(nonApplicableGroup.customConfigItems[0].isApplicable).toBe(false)
	})

	it("should set applicable-flags to true, if at least one checksum of selected map is available in a custom config", () => {
		CustomConfigHelper.loadCustomConfigs = jest.fn().mockReturnValue(new Map([["customConfigKey_1", customConfigStub1]]))
		const fileMapCheckSumsByMapSelectionMode = new Map([[CustomConfigMapSelectionMode.MULTIPLE, ["checksum1"]]])

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(fileMapCheckSumsByMapSelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1.cc.json_map2.cc.json_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)
	})

	it("should set applicable-flags to true, if selected CustomConfigMapSelectionMode does not match actual FileSelectionState but selected maps are available in a custom config", () => {
		CustomConfigHelper.loadCustomConfigs = jest.fn().mockReturnValue(new Map([["customConfigKey_1", customConfigStub1]]))
		const fileMapCheckSumsByMapSelectionMode = new Map([[CustomConfigMapSelectionMode.DELTA, ["checksum1", "checksum2"]]])

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(fileMapCheckSumsByMapSelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("map1.cc.json_map2.cc.json_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)
	})

	it("should return empty maps when no custom configs and no visible files are given", () => {
		const actualCustomConfigItemGroups = getCustomConfigItemGroups(new Map())

		expect(actualCustomConfigItemGroups.applicableItems.size).toBe(0)
		expect(actualCustomConfigItemGroups.nonApplicableItems.size).toBeGreaterThan(0)
	})
})
