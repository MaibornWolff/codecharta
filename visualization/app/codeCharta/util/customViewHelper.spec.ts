import {CustomViewHelper} from "./customViewHelper";
import {CustomView} from "../model/customView/customView.api.model";
import {CustomViewItem} from "../ui/customViews/customViews.component";
import {CustomViewBuilder} from "./customViewBuilder";
import {State} from "../codeCharta.model";

describe("CustomViewHelper", () => {
    describe("addCustomView", () => {
        it("should add custom view and store them to localStorage", () => {
            localStorage.setItem = jest.fn()

            const customViewStub = {name: "stubbedView1", stateSettings: {}} as CustomView

            CustomViewHelper.addCustomView(customViewStub)

            expect(localStorage.setItem).toHaveBeenCalledWith("customViews", expect.stringContaining("customViews"))

            expect(CustomViewHelper.hasCustomView(customViewStub.name)).toBeTruthy()
            const receivedCustomView = CustomViewHelper.getCustomViewSettings(customViewStub.name)
            expect(receivedCustomView).toStrictEqual(customViewStub)
        })
    })

    describe("getCustomViewsAmountByMap", () => {
        it("should count CustomViews for a specific map name", () => {
            localStorage.setItem = jest.fn()

            const customViewStub1 = {name: "stubbedView1", mapName: "testy.cc.json", stateSettings: {}} as CustomView
            const customViewStub2 = {name: "stubbedView2", mapName: "testy.cc.json", stateSettings: {}} as CustomView
            const customViewStub3 = {name: "stubbedView3", mapName: "another.cc.json", stateSettings: {}} as CustomView

            CustomViewHelper.addCustomView(customViewStub1)
            CustomViewHelper.addCustomView(customViewStub2)
            CustomViewHelper.addCustomView(customViewStub3)

            expect(CustomViewHelper.getCustomViewsAmountByMap(customViewStub1.mapName)).toEqual(2)
            expect(CustomViewHelper.getCustomViewsAmountByMap(customViewStub3.mapName)).toEqual(1)
        })
    })

    describe("getViewNameSuggestion", () => {
        it("should return the right CustomView name suggestion based on already stored CustomViews", () => {
            localStorage.setItem = jest.fn()

            const customViewStub1 = {name: "stubbedView1", mapName: "testy.cc.json", stateSettings: {}} as CustomView

            // Reset customViews in CustomViewHelper
            Object.defineProperty(CustomViewHelper, 'customViews', { get: () => new Map()})
            expect(CustomViewHelper.getViewNameSuggestionByMapName(customViewStub1.mapName)).toBe('testy #1')

            const myMap = new Map()
            myMap.set(customViewStub1.name, customViewStub1)

            Object.defineProperty(CustomViewHelper, 'customViews', { get: () => myMap})
            expect(CustomViewHelper.getViewNameSuggestionByMapName(customViewStub1.mapName)).toBe('testy #2')
        })

        it("should return empty name suggestion for empty mapName", () => {
            expect(CustomViewHelper.getViewNameSuggestionByMapName("")).toBe('')
        })
    })

    describe("deleteCustomView", () => {
        it("should delete CustomView from Local Storage", () => {
            localStorage.setItem = jest.fn()

            const customViewStub1 = {name: "stubbedView1", mapName: "testy.cc.json", stateSettings: {}} as CustomView

            CustomViewHelper.addCustomView(customViewStub1)
            expect(CustomViewHelper.hasCustomView(customViewStub1.name)).toBeTruthy()

            CustomViewHelper.deleteCustomView(customViewStub1.name)
            expect(CustomViewHelper.hasCustomView(customViewStub1.name)).toBeFalsy()

            // One call for the add and another one for the delete
            expect(localStorage.setItem).toHaveBeenCalledTimes(2)
        })
    })

    describe("sortCustomViewDropDownList", () => {
        it("should put applicable CustomViews at the beginning of the list (sorted by name)", () => {
            const customViewItemsDropDown: CustomViewItem[] = []

            customViewItemsDropDown.push({name: "customViewName1",mapName: "customViewMap.cc.json",isApplicable: false})
            customViewItemsDropDown.push({name: "customViewName2",mapName: "customViewMap.cc.json",isApplicable: true})
            customViewItemsDropDown.push({name: "customViewName3",mapName: "customViewMap.cc.json",isApplicable: true})
            customViewItemsDropDown.push({name: "customViewName4",mapName: "customViewMap.cc.json",isApplicable: false})

            customViewItemsDropDown.sort(CustomViewHelper.sortCustomViewDropDownList())

            expect(customViewItemsDropDown[0].name).toBe("customViewName2")
            expect(customViewItemsDropDown[1].name).toBe("customViewName3")
            expect(customViewItemsDropDown[2].name).toBe("customViewName1")
            expect(customViewItemsDropDown[3].name).toBe("customViewName4")
        })
    })

    describe("getCustomViewItems", () => {
        it("should set applicable-flags properly", () => {
            const customViewStub1 = {name: "view1", mapName: "mocky.cc.json", stateSettings: {}} as CustomView
            const customViewStub2 = {name: "view2", mapName: "another.mocky.cc.json", stateSettings: {}} as CustomView

            CustomViewHelper.addCustomView(customViewStub1)
            CustomViewHelper.addCustomView(customViewStub2)

            const customViewItems = CustomViewHelper.getCustomViewItems("mocky.cc.json")

            expect(customViewItems[0].name).toBe("view1")
            expect(customViewItems[0].isApplicable).toBeTruthy()

            expect(customViewItems[1].name).toBe("view2")
            expect(customViewItems[1].isApplicable).toBeFalsy()
        })

        it("should set all applicable-flags to true, if mapName is empty/missing", () => {
            const customViewStub1 = {name: "view1", mapName: "mocky.cc.json", stateSettings: {}} as CustomView
            const customViewStub2 = {name: "view2", mapName: "another.mocky.cc.json", stateSettings: {}} as CustomView

            CustomViewHelper.addCustomView(customViewStub1)
            CustomViewHelper.addCustomView(customViewStub2)

            const customViewItems = CustomViewHelper.getCustomViewItems("")

            expect(customViewItems[0].name).toBe("view1")
            expect(customViewItems[0].isApplicable).toBeTruthy()

            expect(customViewItems[1].name).toBe("view2")
            expect(customViewItems[1].isApplicable).toBeTruthy()
        })
    })

    describe("createCustomView", () => {
        it("should call CustomViewBuilder to build new CustomView from State", () => {
            CustomViewBuilder.buildFromState = jest.fn()

            CustomViewHelper.createNewCustomView('newViewName', {} as State)

            expect(CustomViewBuilder.buildFromState).toHaveBeenCalledWith('newViewName', {} as State)
        })
    })
})
