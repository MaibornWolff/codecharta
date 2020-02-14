import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { AttributeTypesAction, AttributeTypesActions } from "./attributeTypes.actions"
import { AttributeTypesService } from "./attributeTypes.service"
import { STATE, withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"

describe("AttributeTypesService", () => {
	let attributeTypesService: AttributeTypesService
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
		attributeTypesService = new AttributeTypesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, attributeTypesService)
		})

		it("should subscribeToFilesSelection to FilesService", () => {
			FilesService.subscribeToFilesSelection = jest.fn()

			rebuildService()

			expect(FilesService.subscribeToFilesSelection).toHaveBeenCalledWith($rootScope, attributeTypesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new attributeTypes value", () => {
			const action: AttributeTypesAction = {
				type: AttributeTypesActions.SET_ATTRIBUTE_TYPES,
				payload: STATE.fileSettings.attributeTypes
			}
			storeService["store"].dispatch(action)

			attributeTypesService.onStoreChanged(AttributeTypesActions.SET_ATTRIBUTE_TYPES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("attribute-types-changed", {
				attributeTypes: STATE.fileSettings.attributeTypes
			})
		})

		it("should not notify anything on non-attribute-types-events", () => {
			attributeTypesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
