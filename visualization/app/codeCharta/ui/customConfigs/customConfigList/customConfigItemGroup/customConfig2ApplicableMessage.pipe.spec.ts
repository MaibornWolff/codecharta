import { CustomConfigItem } from "../../customConfigs.component"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import * as getMissingCustomConfigModeAndMaps from "./getMissingCustomConfigModeAndMaps"
import { CustomConfig2ApplicableMessage } from "./customConfig2ApplicableMessage.pipe"
import { defaultState } from "../../../../state/store/state.manager"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

describe("customConfig2ApplicableMessage", () => {
    const customConfigItem = {
        assignedMaps: new Map([
            ["checksum1", "file1"],
            ["checksum2", "file2"]
        ]),
        mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE
    } as CustomConfigItem
    const state = { getValue: () => defaultState } as State<CcState>

    it("should return 'Apply Custom View' message when there is no map selection mode difference and maps are not missing", () => {
        jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
            mapSelectionMode: "",
            mapNames: []
        }))

        expect(new CustomConfig2ApplicableMessage(state).transform(customConfigItem)).toBe("Apply Custom View")
    })

    it("should show the map selection mode required to be totally clickable when the mode differs from the custom config", () => {
        jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
            mapSelectionMode: "DELTA",
            mapNames: []
        }))

        expect(new CustomConfig2ApplicableMessage(state).transform(customConfigItem)).toBe(
            "This view is partially applicable. To complete your view, please switch to the DELTA mode."
        )
    })

    it("should show missing maps to be fully clickable if the currently selected maps differ from the custom config", () => {
        jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
            mapSelectionMode: "",
            mapNames: ["file1"]
        }))

        expect(new CustomConfig2ApplicableMessage(state).transform(customConfigItem)).toBe(
            "To fulfill your view, please select the following map(s): file1."
        )
    })

    it("should show the map selection mode and missing maps required for the custom config to be totally clickable if both attributes differ from the config", () => {
        jest.spyOn(getMissingCustomConfigModeAndMaps, "getMissingCustomConfigModeAndMaps").mockImplementation(() => ({
            mapSelectionMode: "STANDARD",
            mapNames: ["file1"]
        }))

        expect(new CustomConfig2ApplicableMessage(state).transform(customConfigItem)).toBe(
            "This view is partially applicable. To complete your view, please switch to the STANDARD mode and select the following map(s): file1."
        )
    })
})
