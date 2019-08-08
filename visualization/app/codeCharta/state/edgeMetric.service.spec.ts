import "./state.module"
import { EdgeMetricService } from "./edgeMetric.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileStateService } from "./fileState.service"

describe("EdgeMetricService", () => {
	let edgeMetricService: EdgeMetricService
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStateService = getService<FileStateService>("fileStateService")
	}

	function rebuildService() {
		this.edgeMetricService = new EdgeMetricService($rootScope, fileStateService)
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricService)
		})
	})
})
