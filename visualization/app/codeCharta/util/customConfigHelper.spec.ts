import { CustomConfigHelper } from "./customConfigHelper"
import { CustomConfig, CustomConfigMapSelectionMode } from "../model/customConfig/customConfig.api.model"
import { CustomConfigItemGroup } from "../ui/customConfigs/customConfigs.component"
import { CustomConfigFileStateConnector } from "../ui/customConfigs/customConfigFileStateConnector"
import * as CustomConfigBuilder from "./customConfigBuilder"
import { LocalStorageCustomConfigs, RecursivePartial, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"

describe("CustomConfigHelper", () => {
	describe("addCustomConfig", () => {
		it("should add custom config and store them to localStorage", () => {
			const customConfigStub = {
				id: "",
				name: "stubbedView1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomConfig
			const customConfigId = CustomConfigBuilder.createCustomConfigIdentifier(
				customConfigStub.mapSelectionMode,
				customConfigStub.assignedMaps,
				customConfigStub.name
			)
			customConfigStub.id = customConfigId

			spyOn(JSON, "stringify")
			JSON["stringify"] = jest.fn(() => {
				return "customConfigStub_asJson"
			})

			spyOn(Storage.prototype, "setItem")

			CustomConfigHelper.addCustomConfig(customConfigStub)

			expect(JSON.stringify).toHaveBeenCalledWith(expect.anything(), stateObjectReplacer)

			expect(localStorage.setItem).toHaveBeenCalledWith(
				CustomConfigHelper["CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT"],
				"customConfigStub_asJson"
			)
			expect(
				CustomConfigHelper.hasCustomConfig(customConfigStub.mapSelectionMode, customConfigStub.assignedMaps, customConfigStub.name)
			).toBe(true)

			const receivedCustomConfig = CustomConfigHelper.getCustomConfigSettings(customConfigStub.id)
			expect(receivedCustomConfig).toStrictEqual(customConfigStub)
		})
	})

	describe("loadCustomConfigs", () => {
		it("should load CustomConfigs from localStorage", () => {
			const customConfigStub: RecursivePartial<CustomConfig> = {
				id: "",
				name: "stubbedView1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			}

			const customConfigId = CustomConfigBuilder.createCustomConfigIdentifier(
				customConfigStub.mapSelectionMode,
				customConfigStub.assignedMaps,
				customConfigStub.name
			)
			customConfigStub.id = customConfigId

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

			expect(localStorage.getItem).toHaveBeenCalledWith(CustomConfigHelper["CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT"])
			expect(JSON.parse).toHaveBeenCalledWith(undefined, stateObjectReviver)
		})
	})

	describe("getCustomConfigsAmountByMapAndMode", () => {
		it("should count CustomConfigs for a specific map name", () => {
			const customConfigStub1 = {
				id: "1",
				name: "stubbedView1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub2 = {
				id: "2",
				name: "stubbedView2",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub3 = {
				id: "3",
				name: "stubbedView3",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub4 = {
				id: "4",
				name: "stubbedView4",
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
					CustomConfigMapSelectionMode.SINGLE
				)
			).toBe(2)
			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub3.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.SINGLE
				)
			).toBe(1)
			expect(
				CustomConfigHelper.getCustomConfigsAmountByMapAndMode(
					customConfigStub4.assignedMaps.join(" "),
					CustomConfigMapSelectionMode.SINGLE
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

	describe("getViewNameSuggestion", () => {
		it("should return the right CustomConfig name suggestion for SINGLE mode", () => {
			const customConfigStub1 = {
				id: "1",
				name: "stubbedView1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customConfigStub1.assignedMaps.join(" "))

			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomConfigFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomConfigMapSelectionMode.SINGLE)

			// Reset customConfigs in CustomConfigHelper
			CustomConfigHelper["customConfigs"].clear()
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe("testy.cc.json #1")

			CustomConfigHelper["customConfigs"].set(customConfigStub1.id, customConfigStub1)
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe("testy.cc.json #2")
		})

		it("should return the right CustomConfig name suggestion for MULTIPLE mode", () => {
			const customConfigStub1 = {
				id: "1",
				name: "stubbedView1",
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
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomConfigHelper["customConfigs"].set(customConfigStub1.name, customConfigStub1)
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return the right CustomConfig name suggestion for DELTA mode", () => {
			const customConfigStub1 = {
				id: "1",
				name: "stubbedView1",
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
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomConfigHelper["customConfigs"].set(customConfigStub1.name, customConfigStub1)
			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return empty name suggestion for empty mapName", () => {
			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValueOnce("")
			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock

			expect(CustomConfigHelper.getViewNameSuggestionByFileState(CustomConfigFileStateConnector.prototype)).toBe("")
		})
	})

	describe("deleteCustomConfig", () => {
		it("should delete CustomConfig from Local Storage", () => {
			CustomConfigHelper["setCustomConfigsToLocalStorage"] = jest.fn()

			const customConfigStub1 = {
				id: "",
				name: "stubbedView1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			const customConfigId = CustomConfigBuilder.createCustomConfigIdentifier(
				customConfigStub1.mapSelectionMode,
				customConfigStub1.assignedMaps,
				customConfigStub1.name
			)
			customConfigStub1.id = customConfigId

			CustomConfigHelper.addCustomConfig(customConfigStub1)
			expect(
				CustomConfigHelper.hasCustomConfig(
					customConfigStub1.mapSelectionMode,
					customConfigStub1.assignedMaps,
					customConfigStub1.name
				)
			).toBe(true)

			CustomConfigHelper.deleteCustomConfig(customConfigStub1.id)
			expect(
				CustomConfigHelper.hasCustomConfig(
					customConfigStub1.mapSelectionMode,
					customConfigStub1.assignedMaps,
					customConfigStub1.name
				)
			).toBe(false)

			// One call for the add and another one for the delete
			expect(CustomConfigHelper["setCustomConfigsToLocalStorage"]).toHaveBeenCalledTimes(2)
		})
	})

	describe("sortCustomConfigDropDownList", () => {
		it("should put applicable CustomConfigs Group at the beginning of the list and sort by mode afterwards", () => {
			const customConfigItemGroups = new Map<string, CustomConfigItemGroup>([
				[
					"notApplicableSingle",
					{
						mapNames: "notApplicableSingle.cc.json",
						mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
						hasApplicableItems: false,
						customConfigItems: []
					}
				],
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
			expect(customConfigItemGroupsDropDown[4].mapNames).toBe("notApplicableSingle.cc.json")
		})
	})

	describe("getCustomConfigItems", () => {
		it("should set applicable-flags to true, if assignedMap name and checksums are matching", () => {
			const customConfigStub1 = {
				id: "1",
				name: "view1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub2 = {
				id: "2",
				name: "view2",
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json", "delta.cc.json"],
				mapChecksum: "1234",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			CustomConfigHelper["customConfigs"].clear()
			CustomConfigHelper.addCustomConfig(customConfigStub1)
			CustomConfigHelper.addCustomConfig(customConfigStub2)

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock
				.mockReturnValueOnce(customConfigStub1.assignedMaps.join(" "))
				.mockReturnValueOnce(customConfigStub2.assignedMaps.join(" "))

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock
				.mockReturnValueOnce(customConfigStub1.mapChecksum)
				.mockReturnValueOnce(customConfigStub2.mapChecksum)

			const getMapSelectionModeMock = jest.fn()
			getMapSelectionModeMock
				.mockReturnValueOnce(CustomConfigMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomConfigMapSelectionMode.DELTA)

			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomConfigFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomConfigFileStateConnector.prototype.getMapSelectionMode = getMapSelectionModeMock

			const customConfigItemGroups = CustomConfigHelper.getCustomConfigItemGroups(CustomConfigFileStateConnector.prototype)

			const singleGroup = customConfigItemGroups.get("mocky.cc.json_SINGLE")
			expect(singleGroup.hasApplicableItems).toBe(true)
			expect(singleGroup.customConfigItems[0].name).toBe("view1")
			expect(singleGroup.customConfigItems[0].isApplicable).toBe(true)

			const deltaGroup = customConfigItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customConfigItems[0].name).toBe("view2")
			expect(deltaGroup.customConfigItems[0].isApplicable).toBe(true)
		})

		it("should set applicable-flags to false, if assignedMap name or checksums are not matching", () => {
			const customConfigStub1 = {
				id: "1",
				name: "view1",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub2 = {
				id: "2",
				name: "view2",
				mapSelectionMode: CustomConfigMapSelectionMode.SINGLE,
				assignedMaps: ["another.mocky.cc.json"],
				mapChecksum: "1234",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig
			const customConfigStub3 = {
				id: "3",
				name: "view3",
				mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json", "delta.cc.json"],
				mapChecksum: "1234;5678",
				customConfigVersion: "1",
				stateSettings: {}
			} as CustomConfig

			CustomConfigHelper["customConfigs"].clear()
			CustomConfigHelper.addCustomConfig(customConfigStub1)
			CustomConfigHelper.addCustomConfig(customConfigStub2)
			CustomConfigHelper.addCustomConfig(customConfigStub3)

			jest.mock("../ui/customConfigs/customConfigFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock
				.mockReturnValueOnce(customConfigStub1.assignedMaps.join(" "))
				.mockReturnValueOnce("notMatchingAssignedMapName2")
				.mockReturnValueOnce(customConfigStub3.assignedMaps.join(" "))

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock
				.mockReturnValueOnce("notMatchingChecksum1")
				.mockReturnValueOnce(customConfigStub2.mapChecksum)
				.mockReturnValueOnce(customConfigStub3.mapChecksum)

			const getMapSelectionModeMock = jest.fn()
			getMapSelectionModeMock
				.mockReturnValueOnce(CustomConfigMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomConfigMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomConfigMapSelectionMode.SINGLE)

			CustomConfigFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomConfigFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomConfigFileStateConnector.prototype.getMapSelectionMode = getMapSelectionModeMock

			const customConfigItemGroups = CustomConfigHelper.getCustomConfigItemGroups(CustomConfigFileStateConnector.prototype)

			const singleGroup = customConfigItemGroups.get("mocky.cc.json_SINGLE")
			expect(singleGroup.customConfigItems[0].name).toBe("view1")
			expect(singleGroup.customConfigItems[0].isApplicable).toBe(false)

			const anotherSingleGroup = customConfigItemGroups.get("another.mocky.cc.json_SINGLE")
			expect(anotherSingleGroup.customConfigItems[0].name).toBe("view2")
			expect(anotherSingleGroup.customConfigItems[0].isApplicable).toBe(false)

			const deltaGroup = customConfigItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customConfigItems[0].name).toBe("view3")
			expect(deltaGroup.customConfigItems[0].isApplicable).toBe(false)
		})
	})
})
