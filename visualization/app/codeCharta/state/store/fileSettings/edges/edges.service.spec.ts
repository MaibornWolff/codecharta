import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgesAction, EdgesActions } from "./edges.actions"
import { EdgesService } from "./edges.service"
import { VALID_EDGE, withMockedEventMethods } from "../../../../util/dataMocks"

describe("EdgesService", () => {
	let edgesService: EdgesService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		edgesService = new EdgesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, edgesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new edges value", () => {
			const action: EdgesAction = {
				type: EdgesActions.SET_EDGES,
				payload: [VALID_EDGE]
			}
			storeService["store"].dispatch(action)

			edgesService.onStoreChanged(EdgesActions.SET_EDGES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("edges-changed", { edges: [VALID_EDGE] })
		})

		it("should not notify anything on non-edges-events", () => {
			edgesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
