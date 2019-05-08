import "./fileExtensionBar.module"
import { FileExtensionBarController } from "./fileExtensionBar.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("FileExtensionBarController", () => {

    let fileExtensionBarController: FileExtensionBarController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.fileExtensionBar")
    }

    function rebuildController() {
        fileExtensionBarController = new FileExtensionBarController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});