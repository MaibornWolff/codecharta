import { IControllerService } from "angular"
import { getService } from "../../../../../mocks/ng.mockhelper"
import { nodeContextMenuColorPickerComponent, NodeContextMenuColorPickerController } from "./nodeContextMenuColorPicker.component"

describe("nodeContextMenuColorPicker.component", () => {
	let nodeContextMenuColorPickerController: NodeContextMenuColorPickerController
	let $rootScope
	let $controller: IControllerService

	beforeEach(() => {
		$rootScope = getService("$rootScope")
		$controller = getService<IControllerService>("$controller")
		nodeContextMenuColorPickerController = $controller(
			NodeContextMenuColorPickerController,
			{ $scope: $rootScope },
			{ markFolder: jest.fn() }
		)
	})

	it("should bind its `mark-folder` attribute one way", () => {
		expect(nodeContextMenuColorPickerComponent.bindings.markFolder).toBe("&")
	})

	it("should set initial value for its color", () => {
		nodeContextMenuColorPickerController.$onInit()

		expect(nodeContextMenuColorPickerController["$scope"].color).toBe("#FF0000")
	})

	it("should call `markFolder` when its color changes", () => {
		nodeContextMenuColorPickerController.$onInit()
		const markFolderSpy = jest.spyOn<any, any>(nodeContextMenuColorPickerController, "markFolder")

		nodeContextMenuColorPickerController["$scope"].nodeContextMenuColorPickerEventApi.onChange("", "#FFFFFF")

		expect(markFolderSpy).toHaveBeenCalled()
		expect(markFolderSpy.mock.calls[0][0]).toEqual({ color: "#FFFFFF" })
	})

	it("should not call `markFolder` when the color is not yet complete", () => {
		nodeContextMenuColorPickerController.$onInit()
		const markFolderSpy = jest.spyOn<any, any>(nodeContextMenuColorPickerController, "markFolder")

		nodeContextMenuColorPickerController["$scope"].nodeContextMenuColorPickerEventApi.onChange("", "#FFFFF")

		expect(markFolderSpy).not.toHaveBeenCalled()
	})
})
