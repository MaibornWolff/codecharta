import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("ToolBarController", () => {

    let toolBarController: ToolBarController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.toolBar")
    }

    function rebuildController() {
        toolBarController = new ToolBarController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});