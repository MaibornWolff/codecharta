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
        withMockedThreeOrbitControlsService()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.centerMapButton")

        threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
    }

    function rebuildController() {
        centerMapButtonController = new CenterMapButtonController(threeOrbitControlsService)
    }

    function withMockedThreeOrbitControlsService() {
        threeOrbitControlsService = centerMapButtonController["threeOrbitControlsService"] = jest.fn().mockReturnValue({
            autoFitTo: jest.fn()
        })()
    }

    describe("fitMapToView", () => {
        it("should call autoFitTo", () => {
            centerMapButtonController.fitMapToView()

            expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
        })
    })

});