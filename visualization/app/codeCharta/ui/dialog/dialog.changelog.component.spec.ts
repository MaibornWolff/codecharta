import "./dialog.changelog.module"
//import { DialogChangelogController } from "./dialog.changelog.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("DialogChangelogController", () => {

    //let dialogChangelogController: DialogChangelogController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.dialogChangelog")
    }

    function rebuildController() {
        //dialogChangelogController = new DialogChangelogController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});
