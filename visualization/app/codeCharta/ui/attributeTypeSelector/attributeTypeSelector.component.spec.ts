import "./attributeTypeSelector.module"
import { AttributeTypeSelectorController } from "./attributeTypeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { AttributeTypeValue, State } from "../../codeCharta.model"
import { resetFiles } from "../../state/store/files/files.actions"

describe("AttributeTypeSelectorController", () => {
	let attributeTypeSelectorController: AttributeTypeSelectorController
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedDispatch()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeTypeSelector")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		attributeTypeSelectorController = new AttributeTypeSelectorController(storeService)
	}

	function withMockedDispatch() {
		attributeTypeSelectorController["storeService"].dispatch = jest.fn(() => {})
		storeService.getState = () => {
			return ({ fileSettings: { attributeTypes: { nodes: { bar: "relative" }, edges: {} } } } as unknown) as State
		}
	}

	describe("setToAbsolute", () => {
		it("should change attributeType to absolute", () => {
			const expected = setAttributeTypes({ nodes: { bar: AttributeTypeValue.absolute }, edges: {} })

			attributeTypeSelectorController.setToAbsolute("bar", "nodes")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})

		it("should set attributeType to absolute for previously non-available metric", () => {
			const expected = setAttributeTypes({ nodes: { foo: AttributeTypeValue.absolute, bar: AttributeTypeValue.relative }, edges: {} })

			attributeTypeSelectorController.setToAbsolute("foo", "nodes")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})
	})

	describe("setToRelative", () => {
		it("should set attributeType to relative", () => {
			const expected = setAttributeTypes({ nodes: { bar: AttributeTypeValue.relative }, edges: { foo: AttributeTypeValue.relative } })

			attributeTypeSelectorController.setToRelative("foo", "edges")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})
	})
})
