import "./state.module"
import { NodeSearchService } from "./nodeSearch.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular";
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service";
import { SettingsService } from "./settings.service";


describe("NodeSearchService", () => {

    let nodeSearchService: NodeSearchService
    let $rootScope: IRootScopeService
    let codeMapPreRenderService: CodeMapPreRenderService
    let settingsService: SettingsService

    beforeEach(() => {
        restartSystem()
        rebuildService()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.state")

        //this.settingsService = getService<SettingsService>("settingsService")
        //this.codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
    }

    function rebuildService() {
        //nodeSearchService = new NodeSearchService($rootScope, codeMapPreRenderService, settingsService)
    }

    describe("someMethodName", () => {
        it("should do something", () => {

        })
    })

    describe("isSearchPatternUpdated", () => {
		xit("should return true because searchPattern was updated in settings", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "newPattern" } })
			expect(result).toEqual(true)
		})

		xit("should return true because searchPattern was updated in settings with empty string", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "" } })
			expect(result).toEqual(true)
		})

		xit("should return false because searchPattern was not updated in settings", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { margin: 42 } })
			expect(result).toEqual(false)
		})
	})
});