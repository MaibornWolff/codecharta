import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { Store as PlainStore } from "../../../../state/store/store"
import { mocked } from "ts-jest/utils"
import { fileMapCheckSumsSelector } from "../fileMapCheckSums.selector"
import { expect } from "@jest/globals"

jest.mock("../fileMapCheckSums.selector", () => ({
	fileMapCheckSumsSelector: jest.fn()
}))
const mockedFileMapCheckSumsSelector = mocked(fileMapCheckSumsSelector)

describe("getMissingCustomConfigModeAndMaps", () => {
	const customConfigItem = {
		assignedMaps: new Map([
			["checksum1", "file1"],
			["checksum2", "file2"]
		]),
		mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE
	} as CustomConfigItem

	it("should return empty values when selected maps and map selection mode are the same as the custom config", () => {
		mockedFileMapCheckSumsSelector.mockImplementationOnce(
			() => new Map([[CustomConfigMapSelectionMode.MULTIPLE, ["checksum1", "checksum2"]]])
		)

		const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, { getValue: PlainStore.store.getState })

		expect(missingModeAndMaps).toEqual({ mode: "", maps: [] })
	})

	it("should return missing maps and mode when the values currently selected differ from the custom config", () => {
		mockedFileMapCheckSumsSelector.mockImplementationOnce(() => new Map([[CustomConfigMapSelectionMode.DELTA, ["checksum2"]]]))

		const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, { getValue: PlainStore.store.getState })

		expect(missingModeAndMaps).toEqual({ mode: "MULTIPLE", maps: ["file1"] })
	})
})
