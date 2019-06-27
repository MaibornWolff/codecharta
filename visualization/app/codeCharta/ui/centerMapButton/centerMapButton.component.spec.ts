import "./centerMapButton.module"
import { CenterMapButtonController } from "./centerMapButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

describe("CenterMapButtonController", () => {

    let centerMapButtonController: CenterMapButtonController
    let threeOrbitControlsService: ThreeOrbitControlsService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.centerMapButton")

        getService<ThreeOrbitControlsService>("threeOrbitControlsService")
    }

    function rebuildController() {
        centerMapButtonController = new CenterMapButtonController(threeOrbitControlsService)
    }

    describe("fitMapToView", () => {
        it("should call autoFitTo", () => {
            centerMapButtonController.fitMapToView()

            expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
        })
    })

});