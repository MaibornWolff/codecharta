import { getDownloadableCustomConfigs } from "./getDownloadableCustomConfigs"
import { CustomConfig, CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { VisibleFilesBySelectionMode } from "../visibleFilesBySelectionMode.selector"
import { expect } from "@jest/globals"

describe("getDownloadableCustomConfigs", () => {
    it("should get an empty map when no applicable custom configs are available", () => {
        const customConfigStub = {
            id: "md5-fileA",
            name: "stubbedConfig",
            mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
            assignedMaps: new Map([["md5-fileA", "fileA"]]),
            stateSettings: {}
        } as CustomConfig
        const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
            mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
            assignedMaps: new Map([["md5-fileB", "fileB"]])
        }
        CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map([["md5-fileA", customConfigStub]]))

        const actualDownloadableCustomConfigs = getDownloadableCustomConfigs(visibleFilesBySelectionMode)

        expect(actualDownloadableCustomConfigs.size).toBe(0)
    })

    it("should get a map with downloadable custom configs when (partially) applicable custom configs are available", () => {
        const customConfigStub1 = {
            id: "md5-fileA",
            name: "stubbedConfig1",
            mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
            assignedMaps: new Map([["md5-fileA", "fileA"]]),
            stateSettings: {}
        } as CustomConfig
        const customConfigStub2 = {
            id: "md5-fileA-fileB",
            name: "stubbedConfig2",
            mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
            assignedMaps: new Map([
                ["md5-fileA", "fileA"],
                ["md5-fileB", "fileB"]
            ]),
            stateSettings: {}
        } as CustomConfig
        const visibleFilesBySelectionMode: VisibleFilesBySelectionMode = {
            mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
            assignedMaps: new Map([
                ["md5-fileA", "fileA"],
                ["md5-fileB", "fileB"]
            ])
        }
        CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(
            new Map([
                ["md5-fileA", customConfigStub1],
                ["md5-fileA-fileB", customConfigStub2]
            ])
        )

        const actualDownloadableCustomConfigs = getDownloadableCustomConfigs(visibleFilesBySelectionMode)

        expect(actualDownloadableCustomConfigs.size).toBe(2)
        expect(actualDownloadableCustomConfigs.get("md5-fileA").assignedMaps).toEqual(new Map([["md5-fileA", "fileA"]]))
        expect(actualDownloadableCustomConfigs.get("md5-fileA-fileB").assignedMaps).toEqual(
            new Map([
                ["md5-fileA", "fileA"],
                ["md5-fileB", "fileB"]
            ])
        )
    })
})
