import "./centerMapButton.module"
import { CenterMapButtonController } from "./centerMapButton.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("CenterMapButtonController", () => {

    let centerMapButtonController: CenterMapButtonController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.centerMapButton")
    }

    function rebuildController() {
        centerMapButtonController = new CenterMapButtonController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});