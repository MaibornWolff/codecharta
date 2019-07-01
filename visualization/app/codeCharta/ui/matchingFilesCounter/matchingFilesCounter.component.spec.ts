import "./matchingFilesCounter.module"
import { MatchingFilesCounterController } from "./matchingFilesCounter.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("MatchingFilesCounterController", () => {

    let matchingFilesCounterController: MatchingFilesCounterController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.matchingFilesCounter")
    }

    function rebuildController() {
        matchingFilesCounterController = new MatchingFilesCounterController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});