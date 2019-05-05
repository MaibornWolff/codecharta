import { LoadingGifController } from "./loadingGif.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("LoadingGifController", () => {

    let loadingGifController: LoadingGifController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.loadingGif")
    }

    function rebuildController() {
        loadingGifController = new LoadingGifController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});