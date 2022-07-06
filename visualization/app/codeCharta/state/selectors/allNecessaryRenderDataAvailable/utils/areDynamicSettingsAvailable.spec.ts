import { ColorMode, DynamicSettings, SortingOption } from "../../../../codeCharta.model"
import { areDynamicSettingsAvailable, _isDynamicSettingAvailable } from "./areDynamicSettingsAvailable"

describe("areDynamicSettingsAvailable", () => {
	it("should return false when colorRange aren't set", () => {
		const dynamicSettings = {
			colorRange: null
		}
		expect(areDynamicSettingsAvailable(dynamicSettings)).toBe(false)
	})

	it("should return false when colorRange.from isn't set", () => {
		const dynamicSettings = {
			colorRange: { from: null, to: 25 }
		}
		expect(areDynamicSettingsAvailable(dynamicSettings)).toBe(false)
	})

	it("should return true when everything is set", () => {
		const dynamicSettings: DynamicSettings = {
			colorMode: ColorMode.trueGradient,
			sortingOption: SortingOption.NAME,
			areaMetric: "rloc",
			heightMetric: "loc",
			colorMetric: "mcc",
			distributionMetric: "pairingRate",
			edgeMetric: "avgCommits",
			focusedNodePath: [],
			searchPattern: "",
			margin: 2,
			colorRange: { from: 0, to: 25 }
		}
		expect(areDynamicSettingsAvailable(dynamicSettings)).toBe(true)
	})

	it("should ignore edgeMetric as edgeMetric is allowed to be unset", () => {
		expect(_isDynamicSettingAvailable("edgeMetric", null)).toBe(true)
	})
})
