import { CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, CustomViewHelper } from "./customViewHelper"
import { CustomView, CustomViewMapSelectionMode, CustomViewsDownloadFile, ExportCustomView } from "../model/customView/customView.api.model"
import { CustomViewItemGroup } from "../ui/customViews/customViews.component"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"
import { LocalStorageCustomViews, stateObjectReplacer, stateObjectReviver } from "../codeCharta.model"
import { klona } from "klona"
import { FileDownloader } from "./fileDownloader"
import { stubDate } from "../../../mocks/dateMock.helper"

describe("CustomViewHelper", () => {
	beforeEach(() => {
		CustomViewHelper["customViews"].clear()
	})

	describe("addCustomView", () => {
		it("should add custom view and store them to localStorage", () => {
			const customViewStub = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomView

			spyOn(JSON, "stringify")
			JSON["stringify"] = jest.fn(() => {
				return "customViewStub_asJson"
			})

			spyOn(Storage.prototype, "setItem")

			CustomViewHelper.addCustomView(customViewStub)

			expect(JSON.stringify).toHaveBeenCalledWith(expect.anything(), stateObjectReplacer)

			expect(localStorage.setItem).toHaveBeenCalledWith(CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, "customViewStub_asJson")

			expect(
				CustomViewHelper.hasCustomViewByName(customViewStub.mapSelectionMode, customViewStub.assignedMaps, customViewStub.name)
			).toBe(true)

			const receivedCustomView = CustomViewHelper.getCustomViewSettings(customViewStub.id)
			expect(receivedCustomView).toStrictEqual(customViewStub)
		})
	})

	describe("loadCustomViews", () => {
		it("should load CustomViews from localStorage", () => {
			const customViewStub = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomView

			const localStorageCustomViews: LocalStorageCustomViews = {
				version: "42",
				customViews: [[customViewStub.id, customViewStub]]
			}

			spyOn(JSON, "parse")
			JSON["parse"] = jest.fn().mockImplementation(() => {
				return localStorageCustomViews
			})

			spyOn(Storage.prototype, "getItem")

			const loadedCustomViews = CustomViewHelper["loadCustomViews"]()
			expect(loadedCustomViews.size).toBe(1)

			expect(localStorage.getItem).toHaveBeenCalledWith(CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT)
			expect(JSON.parse).toHaveBeenCalledWith(undefined, stateObjectReviver)
		})
	})

	describe("getCustomViewsAmountByMapAndMode", () => {
		it("should count CustomViews for a specific map name", () => {
			const customViewStub1 = {
				id: "1-invalid-md5-checksum",
				name: "stubbedCustomView3",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2-invalid-md5-checksum",
				name: "stubbedCustomView4",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				id: "3-invalid-md5-checksum",
				name: "stubbedCustomView5",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub4 = {
				id: "4-invalid-md5-checksum",
				name: "stubbedCustomView6",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)
			CustomViewHelper.addCustomView(customViewStub3)
			CustomViewHelper.addCustomView(customViewStub4)

			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub1.assignedMaps.join(" "), CustomViewMapSelectionMode.SINGLE)
			).toBe(2)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub3.assignedMaps.join(" "), CustomViewMapSelectionMode.SINGLE)
			).toBe(1)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMaps.join(" "), CustomViewMapSelectionMode.SINGLE)
			).toBe(1)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMaps.join(" "), CustomViewMapSelectionMode.DELTA)
			).toBe(1)
		})
	})

	describe("getCustomViewNameSuggestion", () => {
		it("should return the right CustomView name suggestion for SINGLE mode", () => {
			const customViewStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView7",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMaps.join(" "))

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.SINGLE)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy.cc.json #1")

			CustomViewHelper["customViews"].set(customViewStub1.id, customViewStub1)
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy.cc.json #2")
		})

		it("should return the right CustomView name suggestion for MULTIPLE mode", () => {
			const customViewStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView8",
				mapSelectionMode: CustomViewMapSelectionMode.MULTIPLE,
				assignedMaps: ["testy1.cc.json", "testy2.cc.json"],
				mapChecksum: "123;1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMaps.join(" "))

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.MULTIPLE)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return the right CustomView name suggestion for DELTA mode", () => {
			const customViewStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView9",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMaps: ["testy1.cc.json", "testy2.cc.json"],
				mapChecksum: "123;1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMaps.join(" "))

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.DELTA)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return empty name suggestion for empty mapName", () => {
			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValueOnce("")
			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock

			expect(CustomViewHelper.getCustomViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("")
		})
	})

	describe("deleteCustomView", () => {
		it("should delete CustomView(s) from Local Storage", () => {
			CustomViewHelper["setCustomViewsToLocalStorage"] = jest.fn()

			const customViewStub1 = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView10",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper.addCustomView(customViewStub1)
			expect(CustomViewHelper.getCustomViewSettings(customViewStub1.id)).not.toBeUndefined()
			expect(
				CustomViewHelper.hasCustomViewByName(customViewStub1.mapSelectionMode, customViewStub1.assignedMaps, customViewStub1.name)
			).toBe(true)

			CustomViewHelper.deleteCustomView(customViewStub1.id)
			expect(CustomViewHelper.getCustomViewSettings(customViewStub1.id)).toBeUndefined()
			expect(
				CustomViewHelper.hasCustomViewByName(customViewStub1.mapSelectionMode, customViewStub1.assignedMaps, customViewStub1.name)
			).toBe(false)

			// One call for the add and another one for the delete
			expect(CustomViewHelper["setCustomViewsToLocalStorage"]).toHaveBeenCalledTimes(2)

			const customViewStub2 = {
				id: "invalid-md5-checksum-2",
				name: "stubbedCustomView11"
			} as CustomView

			// Batch delete Custom Views
			CustomViewHelper["customViews"].clear()
			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)
			CustomViewHelper.deleteCustomViews([customViewStub1, customViewStub2])
			expect(CustomViewHelper.getCustomViews().size).toBe(0)
		})
	})

	describe("sortCustomViewDropDownList", () => {
		it("should put applicable CustomViews Group at the beginning of the list and sort by mode afterwards", () => {
			const customViewItemGroups = new Map<string, CustomViewItemGroup>([
				[
					"notApplicableSingle",
					{
						mapNames: "notApplicableSingle.cc.json",
						mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
						hasApplicableItems: false,
						customViewItems: []
					}
				],
				[
					"applicableMultiple",
					{
						mapNames: "applicableMultiple1.cc.json applicableMultiple2.cc.json",
						mapSelectionMode: CustomViewMapSelectionMode.MULTIPLE,
						hasApplicableItems: true,
						customViewItems: []
					}
				],
				[
					"notApplicableDelta1",
					{
						mapNames: "notApplicableDelta.cc.json",
						mapSelectionMode: CustomViewMapSelectionMode.DELTA,
						hasApplicableItems: false,
						customViewItems: []
					}
				],
				[
					"notApplicableDelta2",
					{
						mapNames: "notApplicableDelta2.cc.json notApplicableDelta2.1.cc.json",
						mapSelectionMode: CustomViewMapSelectionMode.DELTA,
						hasApplicableItems: false,
						customViewItems: []
					}
				],
				[
					"notApplicableMultiple",
					{
						mapNames: "notApplicableMultiple1.cc.json notApplicableMultiple2.cc.json",
						mapSelectionMode: CustomViewMapSelectionMode.MULTIPLE,
						hasApplicableItems: false,
						customViewItems: []
					}
				]
			])

			const customViewItemGroupsDropDown = [...customViewItemGroups.values()]
			customViewItemGroupsDropDown.sort(CustomViewHelper.sortCustomViewDropDownGroupList)

			expect(customViewItemGroupsDropDown[0].mapNames).toBe("applicableMultiple1.cc.json applicableMultiple2.cc.json")
			expect(customViewItemGroupsDropDown[1].mapNames).toBe("notApplicableDelta.cc.json")
			expect(customViewItemGroupsDropDown[2].mapNames).toBe("notApplicableDelta2.cc.json notApplicableDelta2.1.cc.json")
			expect(customViewItemGroupsDropDown[3].mapNames).toBe("notApplicableMultiple1.cc.json notApplicableMultiple2.cc.json")
			expect(customViewItemGroupsDropDown[4].mapNames).toBe("notApplicableSingle.cc.json")
		})
	})

	describe("getCustomViewItems", () => {
		it("should set applicable-flags to true, if assignedMap name and checksums are matching", () => {
			const customViewStub1 = {
				id: "1-invalid-md5-checksum",
				name: "customView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2-invalid-md5-checksum",
				name: "customView2",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json", "delta.cc.json"],
				mapChecksum: "1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper["customViews"].clear()
			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock
				.mockReturnValueOnce(customViewStub1.assignedMaps.join(" "))
				.mockReturnValueOnce(customViewStub2.assignedMaps.join(" "))

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock.mockReturnValueOnce(customViewStub1.mapChecksum).mockReturnValueOnce(customViewStub2.mapChecksum)

			const getMapSelectionModeMock = jest.fn()
			getMapSelectionModeMock
				.mockReturnValueOnce(CustomViewMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomViewMapSelectionMode.DELTA)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = getMapSelectionModeMock

			const customViewItemGroups = CustomViewHelper.getCustomViewItemGroups(CustomViewFileStateConnector.prototype)

			const singleGroup = customViewItemGroups.get("mocky.cc.json_SINGLE")
			expect(singleGroup.hasApplicableItems).toBe(true)
			expect(singleGroup.customViewItems[0].name).toBe("customView1")
			expect(singleGroup.customViewItems[0].isApplicable).toBe(true)

			const deltaGroup = customViewItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customViewItems[0].name).toBe("customView2")
			expect(deltaGroup.customViewItems[0].isApplicable).toBe(true)
		})

		it("should set applicable-flags to false, if assignedMap name or mapChecksums are not matching", () => {
			const customViewStub1 = {
				id: "1-invalid-md5-checksum",
				name: "customView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2-invalid-md5-checksum",
				name: "customView2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["another.mocky.cc.json"],
				mapChecksum: "1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				id: "3-invalid-md5-checksum",
				name: "customView3",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMaps: ["another.cc.json", "delta.cc.json"],
				mapChecksum: "1234;5678",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper["customViews"].clear()
			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)
			CustomViewHelper.addCustomView(customViewStub3)

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock
				.mockReturnValueOnce(customViewStub1.assignedMaps.join(" "))
				.mockReturnValueOnce("notMatchingAssignedMapName2")
				.mockReturnValueOnce(customViewStub3.assignedMaps.join(" "))

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock
				.mockReturnValueOnce("notMatchingChecksum1")
				.mockReturnValueOnce("notMatchingChecksum2")
				.mockReturnValueOnce(customViewStub3.mapChecksum)

			const getMapSelectionModeMock = jest.fn()
			getMapSelectionModeMock
				.mockReturnValueOnce(CustomViewMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomViewMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomViewMapSelectionMode.SINGLE)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = getMapSelectionModeMock

			const customViewItemGroups = CustomViewHelper.getCustomViewItemGroups(CustomViewFileStateConnector.prototype)

			const singleGroup = customViewItemGroups.get("mocky.cc.json_SINGLE")
			expect(singleGroup.customViewItems[0].name).toBe("customView1")
			expect(singleGroup.customViewItems[0].isApplicable).toBe(false)

			const anotherSingleGroup = customViewItemGroups.get("another.mocky.cc.json_SINGLE")
			expect(anotherSingleGroup.customViewItems[0].name).toBe("customView2")
			expect(anotherSingleGroup.customViewItems[0].isApplicable).toBe(false)

			const deltaGroup = customViewItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customViewItems[0].name).toBe("customView3")
			expect(deltaGroup.customViewItems[0].isApplicable).toBe(false)
		})
	})

	describe("importCustomViews", () => {
		it("should import not existing Custom Views and prevent duplicate names, if any", () => {
			const alreadyExistingCustomViewStub = {
				id: "1-invalid-md5-checksum",
				name: "already-existing-exported-customView",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["exampleMap1.cc.json", "exampleMap2cc.json"]
			} as ExportCustomView

			const exportCustomViewStub = {
				id: "2-invalid-md5-checksum-imported",
				name: "to-be-imported"
			} as ExportCustomView

			const exportCustomViewDuplicateName = {
				id: "3-invalid-md5-checksum-imported",
				name: "already-existing-exported-customView",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["exampleMap1.cc.json", "exampleMap2cc.json"],
				// Timestamp of 2020-11-20_13-19
				creationTime: 1_605_878_386_493
			} as ExportCustomView

			const exportedCustomViews: Map<string, ExportCustomView> = new Map()
			exportedCustomViews.set(alreadyExistingCustomViewStub.id, alreadyExistingCustomViewStub)
			exportedCustomViews.set(exportCustomViewStub.id, exportCustomViewStub)
			exportedCustomViews.set(exportCustomViewDuplicateName.id, klona(exportCustomViewDuplicateName))

			const mockedDownloadFile: CustomViewsDownloadFile = {
				downloadApiVersion: "",
				timestamp: 0,
				customViews: exportedCustomViews
			}

			spyOn(JSON, "parse")
			JSON["parse"] = jest.fn().mockReturnValue(mockedDownloadFile)

			// Mock first customView to be already existent
			CustomViewHelper["customViews"].clear()
			CustomViewHelper.addCustomView(CustomViewHelper.createExportCustomViewFromView(alreadyExistingCustomViewStub))

			CustomViewHelper.importCustomViews("not-relevant-json-string-due-to-mocking")

			const customViews = CustomViewHelper.getCustomViews()
			expect(customViews.size).toBe(3)
			expect(customViews.get(alreadyExistingCustomViewStub.id).name).toBe(alreadyExistingCustomViewStub.name)
			expect(customViews.get(exportCustomViewStub.id).name).toBe(exportCustomViewStub.name)
			expect(customViews.get(exportCustomViewDuplicateName.id).name).toBe(`${exportCustomViewDuplicateName.name} (2020-11-20_13-19)`)
		})
	})

	describe("downloadCustomViews", () => {
		stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
		const newDate = "2018-12-14_09-39"

		it("should trigger download and append the download-file-name with the one and only selected map name", () => {
			const exportCustomView1 = {
				id: "1-invalid-md5-checksum",
				name: "customView1"
			} as ExportCustomView

			const exportCustomView2 = {
				id: "2-invalid-md5-checksum",
				name: "customView2"
			} as ExportCustomView

			const exportedCustomViews: Map<string, ExportCustomView> = new Map()
			exportedCustomViews.set(exportCustomView1.id, exportCustomView1)
			exportedCustomViews.set(exportCustomView2.id, exportCustomView2)

			jest.mock("../ui/customViews/customViewFileStateConnector")

			CustomViewFileStateConnector.prototype.isDeltaMode = jest.fn().mockReturnValue(false)
			CustomViewFileStateConnector.prototype.getAmountOfUploadedFiles = jest.fn().mockReturnValue(1)
			CustomViewFileStateConnector.prototype.isEachFileSelected = jest.fn().mockReturnValue(true)
			CustomViewFileStateConnector.prototype.getJointMapName = jest.fn().mockReturnValue("mocked_currently_uploaded_map.cc.json")

			jest.spyOn(JSON, "stringify").mockImplementation(() => {
				return "mock_serialized_customView_to_be_downloaded"
			})

			FileDownloader.downloadData = jest.fn()

			CustomViewHelper.downloadCustomViews(exportedCustomViews, CustomViewFileStateConnector.prototype)
			expect(FileDownloader.downloadData).toHaveBeenCalledWith(
				"mock_serialized_customView_to_be_downloaded",
				`mocked_currently_uploaded_map_${newDate}.cc.config.json`
			)
		})
	})
	describe("get custom view by name", () => {
		it("should return null when customView name is invalid", () => {
			const result = CustomViewHelper.getCustomViewByName(CustomViewMapSelectionMode.SINGLE, [], "invalidCustomView")
			expect(result).toEqual(null)
		})
		it("should return custom view", () => {
			const customViewStub = {
				id: "invalid-md5-checksum",
				name: "stubbedCustomView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["test.cc.json"],
				stateSettings: {}
			} as CustomView

			CustomViewHelper.addCustomView(customViewStub)
			expect(
				CustomViewHelper.hasCustomViewByName(customViewStub.mapSelectionMode, customViewStub.assignedMaps, customViewStub.name)
			).toBe(true)
			const result = CustomViewHelper.getCustomViewByName(
				customViewStub.mapSelectionMode,
				customViewStub.assignedMaps,
				customViewStub.name
			)
			expect(result).toEqual(customViewStub)
		})
	})
})
