import { CustomConfigItem } from "../../customConfigs.component"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"

import * as getMissingCustomConfigModeAndMaps from "./getMissingCustomConfigModeAndMaps"
import { CustomConfig2ApplicableColor } from "./customConfig2ApplicableColor.pipe"

describe("customConfig2ApplicableColorPipe", () => {
	const customConfigItem = {
		assignedMaps: new Map([
			["checksum1", "file1"],
			["checksum2", "file2"]
		]),
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE
	} as CustomConfigItem

	it("should transform black color", () => {
		jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
			mapSelectionMode: "",
			mapNames: []
		}))

		expect(new CustomConfig2ApplicableColor({ getValue: jest.fn() }).transform(customConfigItem)).toBe("rgba(0, 0, 0, 0.87)")
	})

	it("should transform grey color", () => {
		jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
			mapSelectionMode: "DELTA",
			mapNames: ["file2"]
		}))

		expect(new CustomConfig2ApplicableColor({ getValue: jest.fn() }).transform(customConfigItem)).toBe("rgb(204, 204, 204)")
	})
})
