import "./sortingControls.module"
import { SortingControlsController } from "./sortingControls.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("SortingControlsController", () => {

    let sortingControlsController: SortingControlsController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.sortingControls")
    }

    function rebuildController() {
        sortingControlsController = new SortingControlsController()
    }

    describe("ss", () =>{})

});