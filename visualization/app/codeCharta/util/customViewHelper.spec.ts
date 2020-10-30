import { CustomViewHelper } from "./customViewHelper"
import { CustomView, CustomViewMapSelectionMode } from "../model/customView/customView.api.model"
import { CustomViewItem } from "../ui/customViews/customViews.component"
import { CustomViewBuilder } from "./customViewBuilder"
import { State } from "../codeCharta.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"

describe("CustomViewHelper", () => {
	describe("addCustomView", () => {
		it("should add custom view and store them to localStorage", () => {
			const customViewStub = { name: "stubbedView1", stateSettings: {} } as CustomView

			CustomViewHelper["setCustomViewsToLocalStorage"] = jest.fn()
			CustomViewHelper.addCustomView(customViewStub)

			expect(CustomViewHelper["setCustomViewsToLocalStorage"]).toHaveBeenCalled()

			expect(CustomViewHelper.hasCustomView(customViewStub.name)).toBeTruthy()
			const receivedCustomView = CustomViewHelper.getCustomViewSettings(customViewStub.name)
			expect(receivedCustomView).toStrictEqual(customViewStub)
		})
	})

	describe("getCustomViewsAmountByMapAndMode", () => {
		it("should count CustomViews for a specific map name", () => {
			const customViewStub1 = {
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "testy.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				name: "stubbedView2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "testy.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				name: "stubbedView3",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "another.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub4 = {
				name: "stubbedView4",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMap: "another.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)
			CustomViewHelper.addCustomView(customViewStub3)
			CustomViewHelper.addCustomView(customViewStub4)

			expect(CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub1.assignedMap, CustomViewMapSelectionMode.SINGLE)).toBe(
				2
			)
			expect(CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub3.assignedMap, CustomViewMapSelectionMode.SINGLE)).toBe(
				1
			)
			expect(CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMap, CustomViewMapSelectionMode.SINGLE)).toBe(
				1
			)
			expect(CustomViewHelper.getCustomViewsAmountByMapAndMode(customViewStub4.assignedMap, CustomViewMapSelectionMode.DELTA)).toBe(1)
		})
	})

	describe("getViewNameSuggestion", () => {
		it("should return the right CustomView name suggestion for SINGLE mode", () => {
			const customViewStub1 = {
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "testy",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMap)

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock.mockReturnValue(customViewStub1.mapChecksum)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.SINGLE)
			CustomViewFileStateConnector.prototype.isMapSelectionModeSingle = jest.fn().mockReturnValue(true)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy #1")

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe("testy #2")
		})

		it("should return the right CustomView name suggestion for MULTIPLE mode", () => {
			const customViewStub1 = {
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.MULTIPLE,
				assignedMap: "testy1 testy2",
				mapChecksum: "123;1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMap)

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock.mockReturnValue(customViewStub1.mapChecksum)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.MULTIPLE)
			CustomViewFileStateConnector.prototype.isMapSelectionModeSingle = jest.fn().mockReturnValue(false)
			CustomViewFileStateConnector.prototype.isMapSelectionModeDelta = jest.fn().mockReturnValue(false)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1 testy2 (multiple) #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1 testy2 (multiple) #2"
			)
		})

		it("should return the right CustomView name suggestion for DELTA mode", () => {
			const customViewStub1 = {
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMap: "testy1 testy2",
				mapChecksum: "123;1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValue(customViewStub1.assignedMap)

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock.mockReturnValue(customViewStub1.mapChecksum)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = jest.fn().mockReturnValue(CustomViewMapSelectionMode.DELTA)
			CustomViewFileStateConnector.prototype.isMapSelectionModeDelta = jest.fn().mockReturnValue(true)

			// Reset customViews in CustomViewHelper
			CustomViewHelper["customViews"].clear()
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1 testy2 (delta) #1"
			)

			CustomViewHelper["customViews"].set(customViewStub1.name, customViewStub1)
			expect(CustomViewHelper.getViewNameSuggestionByFileState(CustomViewFileStateConnector.prototype)).toBe(
				"testy1 testy2 (delta) #2"
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
				name: "stubbedView1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "testy.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper.addCustomView(customViewStub1)
			expect(CustomViewHelper.hasCustomView(customViewStub1.name)).toBeTruthy()

			CustomViewHelper.deleteCustomView(customViewStub1.name)
			expect(CustomViewHelper.hasCustomView(customViewStub1.name)).toBeFalsy()

			// One call for the add and another one for the delete
			expect(CustomViewHelper["setCustomViewsToLocalStorage"]).toHaveBeenCalledTimes(2)
		})
	})

	describe("sortCustomViewDropDownList", () => {
		it("should put applicable CustomViews at the beginning of the list (sorted by name)", () => {
			const customViewItemsDropDown: CustomViewItem[] = []

			customViewItemsDropDown.push({
				name: "customViewName1",
				mapNames: "customViewMap.cc.json",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				isApplicable: false
			})
			customViewItemsDropDown.push({
				name: "customViewName2",
				mapNames: "customViewMap.cc.json",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				isApplicable: true
			})
			customViewItemsDropDown.push({
				name: "customViewName3",
				mapNames: "customViewMap.cc.json",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				isApplicable: true
			})
			customViewItemsDropDown.push({
				name: "customViewName4",
				mapNames: "customViewMap.cc.json",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				isApplicable: false
			})

			customViewItemsDropDown.sort(CustomViewHelper.sortCustomViewDropDownList())

			expect(customViewItemsDropDown[0].name).toBe("customViewName2")
			expect(customViewItemsDropDown[1].name).toBe("customViewName3")
			expect(customViewItemsDropDown[2].name).toBe("customViewName1")
			expect(customViewItemsDropDown[3].name).toBe("customViewName4")
		})
	})

	describe("getCustomViewItems", () => {
		it("should set applicable-flags to true, if assignedMap name and checksums are matching", () => {
			const customViewStub1 = {
				name: "view1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "mocky.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				name: "view2",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMap: "another.cc.json delta.cc.json",
				mapChecksum: "1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView

			CustomViewHelper["customViews"].clear()
			CustomViewHelper.addCustomView(customViewStub1)
			CustomViewHelper.addCustomView(customViewStub2)

			jest.mock("../ui/customViews/customViewFileStateConnector")

			const getJointMapNameMock = jest.fn()
			getJointMapNameMock.mockReturnValueOnce(customViewStub1.assignedMap).mockReturnValueOnce(customViewStub2.assignedMap)

			const getChecksumOfAssignedMapsMock = jest.fn()
			getChecksumOfAssignedMapsMock.mockReturnValueOnce(customViewStub1.mapChecksum).mockReturnValueOnce(customViewStub2.mapChecksum)

			const getMapSelectionModeMock = jest.fn()
			getMapSelectionModeMock
				.mockReturnValueOnce(CustomViewMapSelectionMode.SINGLE)
				.mockReturnValueOnce(CustomViewMapSelectionMode.DELTA)

			CustomViewFileStateConnector.prototype.getJointMapName = getJointMapNameMock
			CustomViewFileStateConnector.prototype.getChecksumOfAssignedMaps = getChecksumOfAssignedMapsMock
			CustomViewFileStateConnector.prototype.getMapSelectionMode = getMapSelectionModeMock

			const customViewItems = CustomViewHelper.getCustomViewItemGroups(CustomViewFileStateConnector.prototype)

			expect(customViewItems[0].name).toBe("view1")
			expect(customViewItems[0].isApplicable).toBe(true)

			expect(customViewItems[1].name).toBe("view2")
			expect(customViewItems[1].isApplicable).toBe(true)
		})

		it("should set applicable-flags to false, if assignedMap name or checksums are not matching", () => {
			const customViewStub1 = {
				name: "view1",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "mocky.cc.json",
				mapChecksum: "123",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub2 = {
				name: "view2",
				mapSelectionMode: CustomViewMapSelectionMode.SINGLE,
				assignedMap: "another.mocky.cc.json",
				mapChecksum: "1234",
				customViewVersion: "1",
				stateSettings: {}
			} as CustomView
			const customViewStub3 = {
				name: "view3",
				mapSelectionMode: CustomViewMapSelectionMode.DELTA,
				assignedMap: "another.cc.json delta.cc.json",
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
				.mockReturnValueOnce(customViewStub1.assignedMap)
				.mockReturnValueOnce("notMatchingAssignedMapName2")
				.mockReturnValueOnce(customViewStub3.assignedMap)

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

			const customViewItems = CustomViewHelper.getCustomViewItemGroups(CustomViewFileStateConnector.prototype)

			expect(customViewItems[0].name).toBe("view1")
			expect(customViewItems[0].isApplicable).toBe(false)

			expect(customViewItems[1].name).toBe("view2")
			expect(customViewItems[1].isApplicable).toBe(false)

			expect(customViewItems[2].name).toBe("view3")
			expect(customViewItems[2].isApplicable).toBe(false)
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
