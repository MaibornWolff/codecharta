import "./searchBar.module"
import { SearchBarController } from "./searchBar.component"
import {instantiateModule} from "../../../../mocks/ng.mockhelper"

describe("SearchBarController", () => {

    let searchBarController: SearchBarController

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.searchBar")
    }

    function rebuildController() {
        searchBarController = new SearchBarController()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

});