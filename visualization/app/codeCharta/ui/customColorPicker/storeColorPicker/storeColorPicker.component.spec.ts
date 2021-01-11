import "../customColorPicker.module"

import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { IScope, IControllerService, ICompileService } from "angular"
import { StoreService } from "../../../state/store.service"
import { MapColorsService } from "../../../state/store/appSettings/mapColors/mapColors.service"
import { StoreColorPickerController, storeColorPickerComponent } from "./storeColorPicker.component"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../../codeCharta.model"

describe("StoreColorPickerController", () => {
	let $rootScope: IScope
	let storeService: StoreService
	let $scope: IScope
	let $compile: ICompileService
	let $controller: IControllerService
	let createStoreColorController: (mapColorFor?: keyof MapColors) => StoreColorPickerController

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.customColorPicker")

		$rootScope = getService<IScope>("$rootScope")
		$scope = $rootScope.$new()
		$compile = getService<ICompileService>("$compile")
		$controller = getService<IControllerService>("$controller")
		storeService = getService<StoreService>("storeService")

		createStoreColorController = (mapColorFor: keyof MapColors = "positive") => {
			return $controller(
				StoreColorPickerController,
				{
					$rootScope,
					$element: $compile(`<cc-store-color-picker map-color-for="${mapColorFor}" label="my label"></cc-store-color-picker>`)(
						$rootScope
					),
					$scope,
					storeService
				},
				{
					mapColorFor
				}
			)
		}
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it("should subscribe to MapColorsService store", () => {
		const mapColorsServiceSubscribeSpy = jest.spyOn(MapColorsService, "subscribe")
		createStoreColorController()
		expect(mapColorsServiceSubscribeSpy).toHaveBeenCalled()
	})

	it("should set the initial color of 'negative' if used for 'negative'", () => {
		const storeColorController = createStoreColorController("negative")
		storeColorController.$onInit()
		expect(storeColorController["$scope"].color).toBe(defaultMapColors["negative"])
	})

	it("should set the initial color of 'positive' if used for 'positive'", () => {
		const storeColorController = createStoreColorController("positive")
		storeColorController.$onInit()
		expect(storeColorController["$scope"].color).toBe(defaultMapColors["positive"])
	})

	it("should set colorPickerOptions to overwrite angularjs-color-picker's default value", () => {
		const storeColorController = createStoreColorController()
		storeColorController.$onInit()
		expect(storeColorController["$scope"].colorPickerOptions).toEqual({ pos: undefined })
	})

	it("should bind map-color-for attribute", () => {
		expect(storeColorPickerComponent.bindings.mapColorFor).toBe("@")
	})

	it("should bind label attribute", () => {
		expect(storeColorPickerComponent.bindings.label).toBe("@")
	})

	it("should use customized template", () => {
		const customBrushSelector = ".cc-color-picker-swatch-brush-icon.fa.fa-paint-brush"
		const customMarginSelector = ".cc-color-picker-grid-margin"
		const customInputSelector = ".color-picker-panel input"

		const storeColorController = createStoreColorController()
		$rootScope.$digest()
		storeColorController.$onInit()

		const ownDomElement = storeColorController["$element"][0]

		expect(ownDomElement.querySelector(customBrushSelector)).not.toBe(null)
		expect(ownDomElement.querySelector(customMarginSelector)).not.toBe(null)
		expect(ownDomElement.querySelector(customInputSelector)).not.toBe(null)
	})

	it("should update its scope's color and brush color onMapColorsChanged if color has changed", () => {
		const storeColorController = createStoreColorController()
		storeColorController.$onInit()

		const updateBrushColorSpy = jest.spyOn<any, any>(storeColorController, "updateBrushColor")

		const newColor = "#ffffff"
		storeColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newColor
		})

		expect(storeColorController["$scope"].color).toBe(newColor)
		expect(updateBrushColorSpy).toHaveBeenCalled()
	})

	it("should not update its scope's color onMapColorsChanged if color hasn't changed", () => {
		// this is important, as the input field is bound to $scope.color
		// and therefore "#fff" would jump immediately to "#ffffff" what is annoying for the user
		const storeColorController = createStoreColorController()
		storeColorController.$onInit()

		const oldColor = "#fff"
		storeColorController["$scope"].color = oldColor
		const newSameColor = "#ffffff"
		storeColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newSameColor
		})

		expect(storeColorController["$scope"].color).toBe(oldColor)
	})

	it("should update the store, when its scope's color has changed to a new color", () => {
		const storeColorController = createStoreColorController()
		$rootScope.$digest()
		storeColorController.$onInit()

		const dispatchSpy = jest.spyOn(storeColorController["storeService"], "dispatch")
		storeColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()

		expect(dispatchSpy).toHaveBeenCalled()
		expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
			payload: { positive: "#ffffff" }
		})
	})

	it("should not update the store, when its scope's color has changed to the same color", () => {
		const storeColorController = createStoreColorController()
		$rootScope.$digest()
		storeColorController.$onInit()

		storeColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()
		const dispatchSpy = jest.spyOn(storeColorController["storeService"], "dispatch")
		storeColorController["$scope"].color = "#fff"

		expect(dispatchSpy).not.toHaveBeenCalled()
	})

	it("should not update the store, when its scope's color has changed but is incomplete", () => {
		const storeColorController = createStoreColorController()
		$rootScope.$digest()
		storeColorController.$onInit()

		const dispatchSpy = jest.spyOn(storeColorController["storeService"], "dispatch")
		storeColorController["$scope"].color = "#ff"
		$rootScope.$digest()

		expect(dispatchSpy).not.toHaveBeenCalled()
	})

	it("should update its brush' color, when its scope's color has changed", () => {
		const storeColorController = createStoreColorController()
		$rootScope.$digest()
		storeColorController.$onInit()

		const updateBrushSpy = jest.spyOn<any, any>(storeColorController, "updateBrushColor")
		storeColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()

		expect(updateBrushSpy).toHaveBeenCalled()
	})
})
