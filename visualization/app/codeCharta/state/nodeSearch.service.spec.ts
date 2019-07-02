import "./state.module"
import { NodeSearchService } from "./nodeSearch.service"
import { instantiateModule } from "../../../mocks/ng.mockhelper"


describe("NodeSearchService", () => {

    let nodeSearchService: NodeSearchService

    beforeEach(() => {
        restartSystem()
        rebuildService()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.state")

        // initialise injected services and used variables
    }

    function rebuildService() {
        nodeSearchService = new NodeSearchService()
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })
});