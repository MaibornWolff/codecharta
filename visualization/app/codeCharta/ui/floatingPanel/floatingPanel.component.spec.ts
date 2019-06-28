import "./floatingPanel.module"
import { FloatingPanelController } from "./floatingPanel.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("FloatingPanelController", () => {

    let floatingPanelController: FloatingPanelController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.floatingPanel")
    }

    function rebuildController() {
        floatingPanelController = new FloatingPanelController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});