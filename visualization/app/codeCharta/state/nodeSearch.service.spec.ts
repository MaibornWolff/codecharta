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

    describe("isSearchPatternUpdated", () => {
		it("should return true because searchPattern was updated in settings", () => {
			const result = searchBarController["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "newPattern" } })
			expect(result).toEqual(true)
		})

		it("should return true because searchPattern was updated in settings with empty string", () => {
			const result = searchBarController["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "" } })
			expect(result).toEqual(true)
		})

		it("should return false because searchPattern was not updated in settings", () => {
			const result = searchBarController["isSearchPatternUpdated"]({ dynamicSettings: { margin: 42 } })
			expect(result).toEqual(false)
		})
	})
});