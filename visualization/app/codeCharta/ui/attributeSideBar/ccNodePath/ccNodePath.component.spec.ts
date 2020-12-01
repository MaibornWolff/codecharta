import angular from "angular"
import "angular-mocks"

import "../attributeSideBar.module"

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
		jest.resetAllMocks()
	})

	it("should not throw initially", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)

		expect(() => {
			$rootScope.$digest()
			component.html()
		}).not.toThrow()
	})

	it("should display path of selected building", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: true, path: "some/file.ts" }
		})
		$rootScope.$digest()

		expect(component.text()).toContain("some/file.ts")
	})

	it("should display no file count information if selected building is a leaf / i.e. a folder", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: true, path: "some/file.ts" }
		})
		$rootScope.$digest()

		expect(component[0].getElementsByClassName("cc-node-file-count").length).toBe(0)
	})

	it("should display 'empty' description for empty folder", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: false, path: "some/file.ts" }
		})
		$rootScope.$digest()

		const fileCountDescriptionElement = component[0].getElementsByClassName("cc-node-file-count")[0]
		expect(fileCountDescriptionElement).not.toBe(undefined)
		expect(fileCountDescriptionElement.textContent).toContain("empty")
	})

	it("should display 'empty' description for empty folder", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: { isLeaf: false, path: "some/file.ts" }
		})
		$rootScope.$digest()

		const fileCountDescriptionElement = component[0].getElementsByClassName("cc-node-file-count")[0]
		expect(fileCountDescriptionElement).not.toBe(undefined)
		expect(fileCountDescriptionElement.textContent).toContain("empty")
	})

	it("should display '1 file' description for folder with one file", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: {
				isLeaf: false,
				path: "some/file.ts",
				attributes: { unary: 1 }
			}
		})
		$rootScope.$digest()

		const fileCountDescriptionElement = component[0].getElementsByClassName("cc-node-file-count")[0]
		expect(fileCountDescriptionElement).not.toBe(undefined)
		expect(fileCountDescriptionElement.textContent).toContain("1 file")
	})

	it("should display 'x files' description for folder with x", () => {
		const component = $compile("<cc-node-path-component></cc-node-path-component>")($rootScope)
		$rootScope.$emit("building-selected", {
			node: {
				isLeaf: false,
				path: "some/file.ts",
				attributes: { unary: 4 }
			}
		})
		$rootScope.$digest()

		const fileCountDescriptionElement = component[0].getElementsByClassName("cc-node-file-count")[0]
		expect(fileCountDescriptionElement).not.toBe(undefined)
		expect(fileCountDescriptionElement.textContent).toContain("4 files")
	})
})
