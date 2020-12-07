import angular from "angular"
import "angular-mocks"

import "../attributeSideBar.module"
import { ccNodePathComponent } from "./ccNodePath.component"

describe("CcNodePathComponent", () => {
	let $compile
	let $rootScope

	beforeEach(() => {
		angular.mock.module("app.codeCharta.ui.attributeSideBar")

		angular.mock.inject(function (_$compile_, _$rootScope_) {
			$compile = _$compile_
			$rootScope = _$rootScope_
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should update its `_viewModel` when a `building-selected`-event is fired", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: {
				isLeaf: false,
				path: "some/file.ts",
				attributes: { unary: 1 }
			}
		})
		$rootScope.$digest()

		const viewModel = component.controller("ccNodePathComponent")._viewModel
		expect(viewModel.node.isLeaf).toBe(false)
		expect(viewModel.node.path).toBe("some/file.ts")
		expect(viewModel.packageFileCount).toBe(1)
		expect(viewModel.fileCountDescription).toBe("1 file")
	})

	it("should display path of selected building", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: true, path: "some/file.ts" }
		})
		$rootScope.$digest()

		expect(component.text()).toContain("some/file.ts")
	})

	it("should display no file count information if selected building is a leaf / i.e. a file", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: true, path: "some/file.ts" }
		})
		$rootScope.$digest()

		expect(component[0].getElementsByClassName("cc-node-file-count").length).toBe(0)
	})

	it("should insert section for file count if selected building is not a leaf / i.e. a folder", () => {
		const getFileCountDescriptionSpy = jest.spyOn(ccNodePathComponent.controller, "getFileCountDescription")
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: false, path: "some/file.ts" }
		})
		$rootScope.$digest()

		const fileCountDescriptionElements = component[0].getElementsByClassName("cc-node-file-count")
		expect(fileCountDescriptionElements.length).toBe(1)
		expect(getFileCountDescriptionSpy).toHaveBeenCalledTimes(1)
	})

	it("should calculate nice description for empty folders", () => {
		expect(ccNodePathComponent.controller.getFileCountDescription(0)).toBe("empty")
	})

	it("should calculate nice description for folders with one file", () => {
		expect(ccNodePathComponent.controller.getFileCountDescription(1)).toBe("1 file")
	})

	it("should calculate nice description for folders with many file", () => {
		expect(ccNodePathComponent.controller.getFileCountDescription(4)).toBe("4 files")
	})
})
