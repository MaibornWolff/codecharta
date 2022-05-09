import { CustomConfig, CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { getCustomConfigItemGroups } from "./getCustomConfigItemGroups"

describe("getCustomConfigItemGroups", () => {
	const customConfigStub1 = {
		id: "1-invalid-md5-checksum",
		name: "config1",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: ["mocky.cc.json"],
		mapChecksum: "123"
	} as CustomConfig

	const customConfigStub2 = {
		id: "2-invalid-md5-checksum",
		name: "config2",
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
		assignedMaps: ["another.cc.json", "delta.cc.json"],
		mapChecksum: "1234"
	} as CustomConfig

	CustomConfigHelper.loadCustomConfigs = jest.fn().mockReturnValue(
		new Map([
			["123", customConfigStub1],
			["1234", customConfigStub2]
		])
	)

	it("should set applicable-flags to true, if assignedMap name and checksums are matching", () => {
		const fileMapCheckSumsByMapSelectionMode = new Map([[CustomConfigMapSelectionMode.MULTIPLE, ["123"]]])

		const actualCustomConfigItemGroups = getCustomConfigItemGroups(fileMapCheckSumsByMapSelectionMode)

		const applicableGroup = actualCustomConfigItemGroups.applicableItems.get("mocky.cc.json_MULTIPLE")
		expect(applicableGroup.customConfigItems[0].name).toBe("config1")
		expect(applicableGroup.customConfigItems[0].isApplicable).toBe(true)

		const nonApplicableGroup = actualCustomConfigItemGroups.nonApplicableItems.get("another.cc.json_delta.cc.json_MULTIPLE")
		expect(nonApplicableGroup.customConfigItems[0].name).toBe("config2")
		expect(nonApplicableGroup.customConfigItems[0].isApplicable).toBe(false)
	})

	it("should return empty maps when no custom configs and no visible files are given", () => {
		const actualCustomConfigItemGroups = getCustomConfigItemGroups(new Map())

		expect(actualCustomConfigItemGroups.applicableItems.size).toBe(0)
		expect(actualCustomConfigItemGroups.nonApplicableItems.size).toBeGreaterThan(0)
	})
})
