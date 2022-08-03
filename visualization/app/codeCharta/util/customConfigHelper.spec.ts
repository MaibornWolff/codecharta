import { CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, CustomConfigHelper } from "./customConfigHelper"
import {
	CustomConfig,
	CustomConfigMapSelectionMode,
	CustomConfigsDownloadFile,
	ExportCustomConfig
} from "../model/customConfig/customConfig.api.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import { LocalStorageCustomConfigs, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { klona } from "klona"
import { FileDownloader } from "./fileDownloader"
import { stubDate } from "../../../mocks/dateMock.helper"

describe("CustomConfigHelper", () => {
	beforeEach(() => {
		CustomConfigHelper["customConfigs"].clear()
	})

	describe("addCustomConfig", () => {
		it("should add custom config and store them to localStorage", () => {
			const customConfigStub = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig1",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomConfig

			spyOn(JSON, "stringify")
			JSON["stringify"] = jest.fn(() => {
				return "customConfigStub_asJson"
			})

			spyOn(Storage.prototype, "setItem")

			CustomConfigHelper.addCustomConfig(customConfigStub)

			expect(JSON.stringify).toHaveBeenCalledWith(expect.anything(), stateObjectReplacer)

			expect(localStorage.setItem).toHaveBeenCalledWith(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT, "customConfigStub_asJson")

			expect(
				CustomConfigHelper.hasCustomConfigByName(
					customConfigStub.mapSelectionMode,
					customConfigStub.assignedMaps,
					customConfigStub.name
				)
			).toBe(true)

			const receivedCustomConfig = CustomConfigHelper.getCustomConfigSettings(customConfigStub.id)
			expect(receivedCustomConfig).toStrictEqual(customConfigStub)
		})
	})

	describe("loadCustomConfigs", () => {
		it("should load CustomConfigs from localStorage", () => {
			const customConfigStub = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig2",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomConfig

			const localStorageCustomConfigs: LocalStorageCustomConfigs = {
				version: "42",
				customConfigs: [[customConfigStub.id, customConfigStub]]
			}

			spyOn(JSON, "parse")
			JSON["parse"] = jest.fn().mockImplementation(() => {
				return localStorageCustomConfigs
			})

			spyOn(Storage.prototype, "getItem")

			const loadedCustomConfigs = CustomConfigHelper["loadCustomConfigs"]()
			expect(loadedCustomConfigs.size).toBe(1)

			expect(localStorage.getItem).toHaveBeenCalledWith(CUSTOM_CONFIGS_LOCAL_STORAGE_ELEMENT)
			expect(JSON.parse).toHaveBeenCalledWith(undefined, stateObjectReviver)
		})

		it("should load Custom Configs from local storage with version 1.0.1 and should not make any changes to them", () => {
			const customConfigStub1 = {
				id: "invalid-md5-checksum1",
				name: "stubbedConfig1",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["test1.cc.json"],
				stateSettings: {}
			} as CustomConfig

			const customConfigStub2 = {
				id: "invalid-md5-checksum2",
				name: "stubbedConfig2",
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: ["test2.cc.json"],
				stateSettings: {}
			} as CustomConfig

			const localStorageCustomConfigs: LocalStorageCustomConfigs = {
				version: "1.0.1",
				customConfigs: [
					[customConfigStub1.id, customConfigStub1],
					[customConfigStub2.id, customConfigStub2]
				]
			}

			CustomConfigHelper["customConfigs"].clear()
			JSON["parse"] = jest.fn().mockImplementation(() => {
				return localStorageCustomConfigs
			})

			const spyOnGetItem = spyOn(Storage.prototype, "getItem")
			const spyOnRemoveItem = spyOn(Storage.prototype, "removeItem")
			const spyOnSetItem = spyOn(Storage.prototype, "setItem")

			const loadedCustomConfigs = CustomConfigHelper["loadCustomConfigs"]()

			expect(spyOnGetItem).toHaveBeenCalledTimes(1)
			expect(spyOnRemoveItem).toHaveBeenCalledTimes(0)
			expect(spyOnSetItem).toHaveBeenCalledTimes(0)
			expect(loadedCustomConfigs.size).toBe(2)
			expect(loadedCustomConfigs.get("invalid-md5-checksum1").mapSelectionMode).toBe(CustomConfigMapSelectionMode.MULTIPLE)
			expect(loadedCustomConfigs.get("invalid-md5-checksum2").mapSelectionMode).toBe(CustomConfigMapSelectionMode.DELTA)
		})
	})

	describe("getCustomConfigsAmountByMapAndMode", () => {
		it("should count CustomConfigs for a specific map name", () => {
			const customConfigStub1 = {
				id: "1-invalid-md5-checksum",
				name: "stubbedConfig3",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub2 = {
				id: "2-invalid-md5-checksum",
				name: "stubbedConfig4",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub3 = {
				id: "3-invalid-md5-checksum",
				name: "stubbedConfig5",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub4 = {
				id: "4-invalid-md5-checksum",
				name: "stubbedConfig6",
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			CustomConfigHelper.addCustomConfig(customConfigStub1)
			CustomConfigHelper.addCustomConfig(customConfigStub2)
			CustomConfigHelper.addCustomConfig(customConfigStub3)
			CustomConfigHelper.addCustomConfig(customConfigStub4)

			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub1.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.MULTIPLE
				)
			).toBe(2)
			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub3.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.MULTIPLE
				)
			).toBe(1)
			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub4.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.MULTIPLE
				)
			).toBe(1)
			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub4.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.DELTA
				)
			).toBe(1)
		})
	})

	describe("getConfigNameSuggestion", () => {
		it("should return the right CustomConfig name suggestion for MULTIPLE mode", () => {
			const customConfigStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig8",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["testy1.cc.json", "testy2.cc.json"],
				mapChecksum: "123;1234",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customConfigStub1.assignedMaps.join(" "))

			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomConfigFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomConfigMapSelectionMode.MULTIPLE)

			// Reset customConfigs in CustomConfigHelper
			CustomConfigHelper["customConfigs"].clear()
			expect(CustomConfigHelper.getConfigNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomConfigHelper["customConfigs"].set(customConfigStub1.name, customConfigStub1)
			expect(CustomConfigHelper.getConfigNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return the right CustomConfig name suggestion for DELTA mode", () => {
			const customConfigStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig9",
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: ["testy1.cc.json", "testy2.cc.json"],
				mapChecksum: "123;1234",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customConfigStub1.assignedMaps.join(" "))

			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomConfigFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomConfigMapSelectionMode.DELTA)

			// Reset customConfigs in CustomConfigHelper
			CustomConfigHelper["customConfigs"].clear()
			expect(CustomConfigHelper.getConfigNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomConfigHelper["customConfigs"].set(customConfigStub1.name, customConfigStub1)
			expect(CustomConfigHelper.getConfigNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return empty name suggestion for empty mapName", () => {
			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValueOnce("")
			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock

			expect(CustomConfigHelper.getConfigNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe("")
		})
	})

	describe("deleteCustomConfig", () => {
		it("should delete CustomConfig(s) from Local Storage", () => {
			CustomConfigHelper["setCustomConfigsToLocalStorage"] = jest.fn()

			const customConfigStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig10",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			CustomConfigHelper.addCustomConfig(customConfigStub1)
			expect(CustomConfigHelper.getCustomConfigSettings(customConfigStub1.id)).not.toBeUndefined()
			expect(
				CustomConfigHelper.hasCustomConfigByName(
					customConfigStub1.mapSelectionMode,
					customConfigStub1.assignedMaps,
					customConfigStub1.name
				)
			).toBe(true)

			CustomConfigHelper.deleteCustomConfig(customConfigStub1.id)
			expect(CustomConfigHelper.getCustomConfigSettings(customConfigStub1.id)).toBeUndefined()
			expect(
				CustomConfigHelper.hasCustomConfigByName(
					customConfigStub1.mapSelectionMode,
					customConfigStub1.assignedMaps,
					customConfigStub1.name
				)
			).toBe(false)

			// One call for the add and another one for the delete
			expect(CustomConfigHelper["setCustomConfigsToLocalStorage"]).toHaveBeenCalledTimes(2)

			const customConfigStub2 = {
				id: "invalid-md5-checksum-2",
				name: "stubbedConfig11"
			} as CustomConfig

			// Batch delete Configs
			CustomConfigHelper["customConfigs"].clear()
			CustomConfigHelper.addCustomConfig(customConfigStub1)
			CustomConfigHelper.addCustomConfig(customConfigStub2)
			CustomConfigHelper.deleteCustomConfigs([customConfigStub1, customConfigStub2])
			expect(CustomConfigHelper.getCustomConfigs().size).toBe(0)
		})
	})

	describe("sortCustomConfigDropDownList", () => {
		it("should put applicable CustomConfigs Group at the beginning of the list and sort by mode afterwards", () => {
			const customConfigItemGroups = new Map<string, CustomConfigItemGroup>([
				[
					"applicableMultiple",
					{
						mapNames: "applicableMultiple1.cc.json applicableMultiple2.cc.json",
						mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
						hasApplicableItems: true,
						customConfigItems: []
					}
				],
				[
					"notApplicableDelta1",
					{
						mapNames: "notApplicableDelta.cc.json",
						mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
						hasApplicableItems: false,
						customConfigItems: []
					}
				],
				[
					"notApplicableDelta2",
					{
						mapNames: "notApplicableDelta2.cc.json notApplicableDelta2.1.cc.json",
						mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
						hasApplicableItems: false,
						customConfigItems: []
					}
				],
				[
					"notApplicableMultiple",
					{
						mapNames: "notApplicableMultiple1.cc.json notApplicableMultiple2.cc.json",
						mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
						hasApplicableItems: false,
						customConfigItems: []
					}
				]
			])

			const customConfigItemGroupsDropDown = [...customConfigItemGroups.values()]
			customConfigItemGroupsDropDown.sort(CustomConfigHelper.sortCustomConfigDropDownGroupList)

			expect(customConfigItemGroupsDropDown[0].mapNames).toBe("applicableMultiple1.cc.json applicableMultiple2.cc.json")
			expect(customConfigItemGroupsDropDown[1].mapNames).toBe("notApplicableDelta.cc.json")
			expect(customConfigItemGroupsDropDown[2].mapNames).toBe("notApplicableDelta2.cc.json notApplicableDelta2.1.cc.json")
			expect(customConfigItemGroupsDropDown[3].mapNames).toBe("notApplicableMultiple1.cc.json notApplicableMultiple2.cc.json")
		})
	})

	describe("importCustomConfigs", () => {
		it("should import not existing Configs and prevent duplicate names, if any", () => {
			const alreadyExistingConfigStub = {
				id: "1-invalid-md5-checksum",
				name: "already-existing-exported-config",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["exampleMap1.cc.json", "exampleMap2cc.json"]
			} as ExportCustomConfig

			const exportCustomConfigStub = {
				id: "2-invalid-md5-checksum-imported",
				name: "to-be-imported"
			} as ExportCustomConfig

			const exportCustomConfigDuplicateName = {
				id: "3-invalid-md5-checksum-imported",
				name: "already-existing-exported-config",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["exampleMap1.cc.json", "exampleMap2cc.json"],
				// Timestamp of 2020-11-20_13-19
				creationTime: 1_605_878_386_493
			} as ExportCustomConfig

			const exportedCustomConfigs: Map<string, ExportCustomConfig> = new Map()
			exportedCustomConfigs.set(alreadyExistingConfigStub.id, alreadyExistingConfigStub)
			exportedCustomConfigs.set(exportCustomConfigStub.id, exportCustomConfigStub)
			exportedCustomConfigs.set(exportCustomConfigDuplicateName.id, klona(exportCustomConfigDuplicateName))

			const mockedDownloadFile: CustomConfigsDownloadFile = {
				downloadApiVersion: "",
				timestamp: 0,
				customConfigs: exportedCustomConfigs
			}

			spyOn(JSON, "parse")
			JSON["parse"] = jest.fn().mockReturnValue(mockedDownloadFile)

			// Mock first config to be already existent
			CustomConfigHelper["customConfigs"].clear()
			CustomConfigHelper.addCustomConfig(CustomConfigHelper.createExportCustomConfigFromConfig(alreadyExistingConfigStub))

			CustomConfigHelper.importCustomConfigs("not-relevant-json-string-due-to-mocking")

			const customConfigs = CustomConfigHelper.getCustomConfigs()
			expect(customConfigs.size).toBe(3)
			expect(customConfigs.get(alreadyExistingConfigStub.id).name).toBe(alreadyExistingConfigStub.name)
			expect(customConfigs.get(exportCustomConfigStub.id).name).toBe(exportCustomConfigStub.name)
			expect(customConfigs.get(exportCustomConfigDuplicateName.id).name).toBe(
				`${exportCustomConfigDuplicateName.name} (2020-11-20_13-19)`
			)
		})
	})

	describe("downloadCustomConfigs", () => {
		stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
		const newDate = "2018-12-14_09-39"

		it("should trigger download and append the download-file-name with the one and only selected map name", () => {
			const exportCustomConfig1 = {
				id: "1-invalid-md5-checksum",
				name: "config1"
			} as ExportCustomConfig

			const exportCustomConfig2 = {
				id: "2-invalid-md5-checksum",
				name: "config2"
			} as ExportCustomConfig

			const exportedCustomConfigs: Map<string, ExportCustomConfig> = new Map()
			exportedCustomConfigs.set(exportCustomConfig1.id, exportCustomConfig1)
			exportedCustomConfigs.set(exportCustomConfig2.id, exportCustomConfig2)

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			CustomConfigFileStateConnector.prototype.isDeltaMode = jest.fn().mockReturnValue(false)
			CustomConfigFileStateConnector.prototype.getAmountOfUploadedFiles = jest.fn().mockReturnValue(1)
			CustomConfigFileStateConnector.prototype.isEachFileSelected = jest.fn().mockReturnValue(true)
			CustomConfigFileStateConnector.prototype.getJointMapName = jest.fn().mockReturnValue("mocked_currently_uploaded_map.cc.json")

			jest.spyOn(JSON, "stringify").mockImplementation(() => {
				return "mock_serialized_config_to_be_downloaded"
			})

			FileDownloader.downloadData = jest.fn()

			CustomConfigHelper.downloadCustomConfigs(exportedCustomConfigs, CustomConfigFileStateConnector.prototype)
			expect(FileDownloader.downloadData).toHaveBeenCalledWith(
				"mock_serialized_config_to_be_downloaded",
				`mocked_currently_uploaded_map_${newDate}.cc.config.json`
			)
		})
	})

	describe("get custom config by name", () => {
		it("should return null when config name is invalid", () => {
			const result = CustomConfigHelper.getCustomConfigByName(CustomConfigMapSelectionMode.MULTIPLE, [], "invalidConfig")
			expect(result).toEqual(null)
		})
		it("should return custom config", () => {
			const customConfigStub = {
				id: "invalid-md5-checksum",
				name: "stubbedConfig1",
				mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomConfig

			CustomConfigHelper.addCustomConfig(customConfigStub)
			expect(
				CustomConfigHelper.hasCustomConfigByName(
					customConfigStub.mapSelectionMode,
					customConfigStub.assignedMaps,
					customConfigStub.name
				)
			).toBe(true)
			const result = CustomConfigHelper.getCustomConfigByName(
				customConfigStub.mapSelectionMode,
				customConfigStub.assignedMaps,
				customConfigStub.name
			)
			expect(result).toEqual(customConfigStub)
		})
	})
})
