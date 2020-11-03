import {CustomViewHelper} from "./customViewHelper"
import {CustomView, CustomViewMapSelectionMode} from "../model/customView/customView.api.model"
import {CustomViewItemGroup} from "../ui/customViews/customViews.component"
import {CustomViewBuilder} from "./customViewBuilder"
import {State} from "../codeCharta.model"
import {CustomViewFileStateConnector} from "../ui/customViews/customViewFileStateConnector"

describe("CustomViewHelper", () => {
	describe("addCustomView", () => {
		it("should add custom view and store them to localStorage", () => {
			const customViewStub = { id: "", name: "stubbedView1", mapSelectionMode: CustomViewMapSelectionMode.SINGLE, assignedMaps: ["test.cc.json"], stateSettings: {} } as CustomView
			const customViewId = CustomViewBuilder.createCustomViewIdentifier(customViewStub.mapSelectionMode, customViewStub.assignedMaps, customViewStub.name)
			customViewStub.id = customViewId

			spyOn(Storage.prototype, 'setItem')

			CustomViewHelper.addCustomView(customViewStub)

			expect(localStorage.setItem).toHaveBeenCalledWith(CustomViewHelper["CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT"], expect.anything())
			expect(CustomViewHelper.hasCustomView(customViewStub.mapSelectionMode, customViewStub.assignedMaps, customViewStub.name)).toBe(true)

			const receivedCustomView = CustomViewHelper.getCustomViewSettings(customViewStub.id)
			expect(receivedCustomView).toStrictEqual(customViewStub)
		})
	})

	describe("getCustomViewsAmountByMapAndMode", () => {
		it("should count CustomViews for a specific map name", () => {
			const customViewStub1 = {
				id: "1",
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2",
				name: "stubbedView2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				id: "3",
				name: "stubbedView3",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["another.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub4 = {
				id: "4",
				name: "stubbedView4",
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
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub1.assignedMaps.join(" "),
					CustomViewMapSelectionMode.SINGLE)
			).toBe(2)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub3.assignedMaps.join(" "),
					CustomViewMapSelectionMode.SINGLE)
			).toBe(1)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMaps.join(" "),
				CustomViewMapSelectionMode.SINGLE))
			.toBe(1)
			expect(
				CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMaps.join(" "),
				CustomViewMapSelectionMode.DELTA))
			.toBe(1)
		})
	})

	describe("getViewNameSuggestion", () => {
		it("should return the right CustomView name suggestion for SINGLE mode", () => {
			const customViewStub1 = {
				id: "1",
				name: "stubbedView1",
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
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy.cc.json #1")

			CustomViewHelper["customViews"].set(customViewStub1.id, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy.cc.json #2")
		})

		it("should return the right CustomView name suggestion for MULTIPLE mode", () => {
			const customViewStub1 = {
				id: "1",
				name: "stubbedView1",
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
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return the right CustomView name suggestion for DELTA mode", () => {
			const customViewStub1 = {
				id: "1",
				name: "stubbedView1",
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
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1.cc.json testy2.cc.json #2"
			)
		})

		it("should return empty name suggestion for empty mapName", () => {
			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValueOnce("")
			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock

			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("")
		})
	})

	describe("deleteCustomView", () => {
		it("should delete CustomView from Local Storage", () => {
			CustomViewHelper["setCustomViewsToLocalStorage"] = jest.fn()

			const customViewStub1 = {
				id: "",
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["testy.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			const customViewId = CustomViewBuilder.createCustomViewIdentifier(customViewStub1.mapSelectionMode, customViewStub1.assignedMaps, customViewStub1.name)
			customViewStub1.id = customViewId

			CustomViewHelper.addCustomView(customViewStub1)
			expect(CustomViewHelper.hasCustomView(customViewStub1.mapSelectionMode, customViewStub1.assignedMaps, customViewStub1.name)).toBe(true)

			CustomViewHelper.deleteCustomView(customViewStub1.id)
			expect(CustomViewHelper.hasCustomView(customViewStub1.mapSelectionMode, customViewStub1.assignedMaps, customViewStub1.name)).toBe(false)

			// One call for the add and another one for the delete
			expect(CustomViewHelper["setCustomViewsToLocalStorage"]).toHaveBeenCalledTimes(2)
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
			customViewItemGroupsDropDown.sort(CustomViewHelper.sortCustomViewDropDownGroupList())

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
				id: "1",
				name: "view1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2",
				name: "view2",
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
			getChecksumOfAssignedMapsMock
				.mockReturnValueOnce(customViewStub1.mapChecksum)
				.mockReturnValueOnce(customViewStub2.mapChecksum)

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
			expect(singleGroup.customViewItems[0].name).toBe("view1")
			expect(singleGroup.customViewItems[0].isApplicable).toBe(true)

			const deltaGroup = customViewItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customViewItems[0].name).toBe("view2")
			expect(deltaGroup.customViewItems[0].isApplicable).toBe(true)
		})

		it("should set applicable-flags to false, if assignedMap name or checksums are not matching", () => {
			const customViewStub1 = {
				id: "1",
				name: "view1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["mocky.cc.json"],
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				id: "2",
				name: "view2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMaps: ["another.mocky.cc.json"],
				mapChecksum: "1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				id: "3",
				name: "view3",
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
				.mockReturnValueOnce(customViewStub2.mapChecksum)
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
			expect(singleGroup.customViewItems[0].name).toBe("view1")
			expect(singleGroup.customViewItems[0].isApplicable).toBe(false)

			const anotherSingleGroup = customViewItemGroups.get("another.mocky.cc.json_SINGLE")
			expect(anotherSingleGroup.customViewItems[0].name).toBe("view2")
			expect(anotherSingleGroup.customViewItems[0].isApplicable).toBe(false)

			const deltaGroup = customViewItemGroups.get("another.cc.json_delta.cc.json_DELTA")
			expect(deltaGroup.customViewItems[0].name).toBe("view3")
			expect(deltaGroup.customViewItems[0].isApplicable).toBe(false)
		})
	})

	describe("createCustomView", () => {
		it("should call CustomViewBuilder to build new CustomView from State", () => {
			CustomViewBuilder.buildFromState = jest.fn()

			CustomViewHelper.createNewCustomView("newViewName", {} as State)

			expect(CustomViewBuilder.buildFromState).toHaveBeenCalledWith("newViewName", {} as State)
		})
	})
})
