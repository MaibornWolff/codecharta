import { CustomConfigMapSelectionMode } from "../../../../../model/customConfig/customConfig.api.model"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CustomConfigColorSchemaBySelectionMode } from "./customConfigColorSchemaBySelectionMode.pipe"

describe("customConfigColorSchemaBySelectionMode", () => {
	it("should return 'positive', 'neutral' and 'negative' color values when config was made in MULTIPLE mode", () => {
		const customConfigItem = {
			mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
			mapColors: {
				positive: "green",
				neutral: "yellow",
				negative: "red",
				selected: "orange",
				positiveDelta: "darkGreen",
				negativeDelta: "darkRed"
			}
		} as CustomConfigItem
		expect(new CustomConfigColorSchemaBySelectionMode().transform(customConfigItem)).toEqual(["green", "yellow", "red", "orange"])
	})

	it("should return 'positiveDelta' and 'negativeDelta' color values when config was made in DELTA mode", () => {
		const customConfigItem = {
			mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
			mapColors: {
				positive: "green",
				neutral: "yellow",
				negative: "red",
				selected: "orange",
				positiveDelta: "darkGreen",
				negativeDelta: "darkRed"
			}
		} as CustomConfigItem

		expect(new CustomConfigColorSchemaBySelectionMode().transform(customConfigItem)).toEqual(["darkGreen", "darkRed", "orange"])
	})
})
