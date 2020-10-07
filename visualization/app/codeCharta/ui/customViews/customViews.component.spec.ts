import "./customViews.module"
import { CustomViewsController } from "./customViews.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("CustomViewsController", () => {

    let customViewsController: CustomViewsController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.customViews")
    }

    function rebuildController() {
        customViewsController = new CustomViewsController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});