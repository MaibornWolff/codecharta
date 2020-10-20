import "./dialog.module.ts"
import {StoreService} from "../../state/store.service"
import {DialogAddCustomViewSettingsComponent} from "./dialog.addCustomViewSettings.component"
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper"
import {IRootScopeService} from "angular";
import {DialogService} from "./dialog.service";
import {FilesService} from "../../state/store/files/files.service";
import {setFiles} from "../../state/store/files/files.actions";
import {FILE_STATES} from "../../util/dataMocks";
import {CustomViewHelper} from "../../util/customViewHelper";

describe("DialogAddScenarioSettingsComponent", () => {
    let dialogAddCustomViewSettings: DialogAddCustomViewSettingsComponent
    let $mdDialog
    let $rootScope: IRootScopeService
    let dialogService: DialogService
    let storeService: StoreService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function rebuildController() {
        dialogAddCustomViewSettings = new DialogAddCustomViewSettingsComponent($rootScope, $mdDialog, storeService, dialogService)
    }

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.dialog")

        $mdDialog = getService("$mdDialog")
        $rootScope = getService<IRootScopeService>("$rootScope")
        storeService = getService<StoreService>("storeService")
        dialogService = getService<DialogService>("dialogService")

        storeService.dispatch(setFiles(FILE_STATES))
    }

    describe("constructor", () => {
        it("should subscribe to FilesService to get currently selected CC file name", () => {
            FilesService.subscribe = jest.fn()

            rebuildController()

            expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, dialogAddCustomViewSettings)
        })
    })

    describe("onFilesSelectionChanged", () => {
        it("event handler should register new name of selected map file", () => {
            dialogAddCustomViewSettings.onFilesSelectionChanged(FILE_STATES)
            expect(dialogAddCustomViewSettings["_viewModel"].customViewName).toBe('fileA #1')
        })
    })

    describe("hide", () => {
        it("should hide dialog properly", () => {
            $mdDialog.hide = jest.fn()

            dialogAddCustomViewSettings.hide()

            expect($mdDialog.hide).toHaveBeenCalled()
        })
    })

    describe("addCustomView", () => {
        it("should create CustomView object and add it", () => {
            CustomViewHelper.createNewCustomView = jest.fn()
            CustomViewHelper.addCustomView = jest.fn()
            $mdDialog.hide = jest.fn()

            dialogAddCustomViewSettings["_viewModel"].customViewName = "mockedViewName"
            dialogAddCustomViewSettings.addCustomView()

            expect(CustomViewHelper.createNewCustomView).toHaveBeenCalledWith("mockedViewName", storeService.getState())
            expect($mdDialog.hide).toHaveBeenCalled()
        })

        it("should show Error message on Exception", () => {
            dialogService.showErrorDialog = jest.fn()
            $mdDialog.hide = jest.fn()
            CustomViewHelper.createNewCustomView = jest.fn()
            CustomViewHelper.addCustomView = jest.fn().mockImplementation(() => {
                throw new Error("An Error occurred");
            });

            dialogAddCustomViewSettings["_viewModel"].customViewName = "mockedViewName"
            dialogAddCustomViewSettings.addCustomView()

            expect(dialogService.showErrorDialog).toHaveBeenCalledWith(expect.stringContaining("An Error occurred"))
            expect($mdDialog.hide).toHaveBeenCalled()
        })
    })

    describe("validateCustomViewName", () => {
        it("should clear info message, if view is valid to be added", () => {
            CustomViewHelper.hasCustomView = jest.fn().mockReturnValue(false)

            dialogAddCustomViewSettings["_viewModel"].addInfoMessage = "to_be_cleared"
            dialogAddCustomViewSettings.validateCustomViewName()

            expect(dialogAddCustomViewSettings["_viewModel"].addInfoMessage).toBe('')
        })

        it("should set warning message, if a view with the same name already exists", () => {
            CustomViewHelper.hasCustomView = jest.fn().mockReturnValue(true)

            dialogAddCustomViewSettings.validateCustomViewName()

            expect(dialogAddCustomViewSettings["_viewModel"].addInfoMessage).toContain("warning")
            expect(dialogAddCustomViewSettings["_viewModel"].addInfoMessage).toContain("override")
        })
    })

    describe("isNewCustomViewValid", () => {
        it("should return true for not empty view names", () => {
            dialogAddCustomViewSettings["_viewModel"].customViewName = "some valid name here"

            expect(dialogAddCustomViewSettings.isNewCustomViewValid()).toBeTruthy()
        })

        it("should return false for empty view names", () => {
            dialogAddCustomViewSettings["_viewModel"].customViewName = ""

            expect(dialogAddCustomViewSettings.isNewCustomViewValid()).toBeFalsy()
        })
    })

})
