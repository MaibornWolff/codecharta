import "./structurePanelSelector.module"
import { StructurePanelSelectorController } from "./structurePanelSelector.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("StructurePanelSelectorController", () => {

    let structurePanelSelectorController: StructurePanelSelectorController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.structurePanelSelector")
    }

    function rebuildController() {
        structurePanelSelectorController = new StructurePanelSelectorController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});