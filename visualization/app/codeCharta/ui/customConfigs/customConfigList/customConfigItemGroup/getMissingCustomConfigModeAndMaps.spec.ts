import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { expect } from "@jest/globals"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"
import { defaultState } from "../../../../state/store/state.manager"

jest.mock("../../visibleFilesBySelectionMode.selector", () => ({
    visibleFilesBySelectionModeSelector: jest.fn()
}))
const mockedVisibleFilesBySelectionModeSelector = jest.mocked(visibleFilesBySelectionModeSelector)

describe("getMissingCustomConfigModeAndMaps", () => {
    const customConfigItem = {
        assignedMaps: new Map([
            ["checksum1", "file1"],
            ["checksum2", "file2"]
        ]),
        mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE
    } as CustomConfigItem

    it("should return empty values when selected maps and map selection mode are the same as the custom config", () => {
        mockedVisibleFilesBySelectionModeSelector.mockImplementationOnce(() => {
            return {
                mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
                assignedMaps: new Map([
                    ["checksum1", "file1"],
                    ["checksum2", "file2"]
                ])
            }
        })

        const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, defaultState)

        expect(missingModeAndMaps).toEqual({ mapSelectionMode: "", mapNames: [] })
    })

    it("should return missing maps and mode when the values currently selected differ from the custom config", () => {
        mockedVisibleFilesBySelectionModeSelector.mockImplementationOnce(() => {
            return {
                mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
                assignedMaps: new Map([["checksum2", "file2"]])
            }
        })

        const missingModeAndMaps = getMissingCustomConfigModeAndMaps(customConfigItem, defaultState)

        expect(missingModeAndMaps).toEqual({ mapSelectionMode: "STANDARD", mapNames: ["file1"] })
    })
})
