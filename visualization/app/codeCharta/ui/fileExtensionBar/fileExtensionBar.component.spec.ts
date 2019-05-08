import "./fileExtensionBar.module"
import { FileExtensionBarController } from "./fileExtensionBar.component"
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper"
import {IRootScopeService} from "angular";
import {SettingsService} from "../../state/settings.service";

describe("FileExtensionBarController", () => {

    let fileExtensionBarController: FileExtensionBarController
    let $rootScope: IRootScopeService
    let settingsService: SettingsService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.fileExtensionBar")

        $rootScope = getService<IRootScopeService>("$rootScope")
        settingsService = getService<SettingsService>("settingsService")
    }

    function rebuildController() {
        fileExtensionBarController = new FileExtensionBarController($rootScope, settingsService)
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});