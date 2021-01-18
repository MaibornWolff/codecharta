import "./mapColorPicker.module"

import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IScope, IControllerService, ICompileService } from "angular"
import { StoreService } from "../../state/store.service"
import { MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"
import { MapColorPickerController, mapColorPickerComponent } from "./mapColorPicker.component"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../codeCharta.model"

describe("MapColorPickerController", () => {
	let $rootScope: IScope
	let storeService: StoreService
	let $scope: IScope
	let $compile: ICompileService
	let $controller: IControllerService
	let createMapColorController: (mapColorFor?: keyof MapColors) => MapColorPickerController

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.mapColorPicker")

		$rootScope = getService<IScope>("$rootScope")
		$scope = $rootScope.$new()
		$compile = getService<ICompileService>("$compile")
		$controller = getService<IControllerService>("$controller")
		storeService = getService<StoreService>("storeService")

		createMapColorController = (mapColorFor: keyof MapColors = "positive") => {
			return $controller(
				MapColorPickerController,
				{
					$rootScope,
					$element: $compile(`<cc-map-color-picker map-color-for="${mapColorFor}" label="my label"></cc-map-color-picker>`)(
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
		createMapColorController()
		expect(mapColorsServiceSubscribeSpy).toHaveBeenCalled()
	})

	it("should set the initial color of 'negative' if used for 'negative'", () => {
		const mapColorController = createMapColorController("negative")
		mapColorController.$onInit()
		expect(mapColorController["$scope"].color).toBe(defaultMapColors["negative"])
	})

	it("should set the initial color of 'positive' if used for 'positive'", () => {
		const mapColorController = createMapColorController("positive")
		mapColorController.$onInit()
		expect(mapColorController["$scope"].color).toBe(defaultMapColors["positive"])
	})

	it("should set colorPickerOptions to overwrite angularjs-color-picker's default value", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()
		expect(mapColorController["$scope"].colorPickerOptions).toEqual({ pos: undefined })
	})

	it("should bind map-color-for attribute", () => {
		expect(mapColorPickerComponent.bindings.mapColorFor).toBe("@")
	})

	it("should bind label attribute", () => {
		expect(mapColorPickerComponent.bindings.label).toBe("@")
	})

	it("should use customized template", () => {
		const customBrushSelector = ".cc-color-picker-swatch-brush-icon.fa.fa-paint-brush"
		const customMarginSelector = ".cc-color-picker-grid-margin"
		const customInputSelector = ".color-picker-panel input"

		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		const ownDomElement = mapColorController["$element"][0]

		expect(ownDomElement.querySelector(customBrushSelector)).not.toBe(null)
		expect(ownDomElement.querySelector(customMarginSelector)).not.toBe(null)
		expect(ownDomElement.querySelector(customInputSelector)).not.toBe(null)
	})

	it("should update its scope's color and brush color onMapColorsChanged if color has changed", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()

		const updateBrushColorSpy = jest.spyOn<any, any>(mapColorController, "updateBrushColor")

		const newColor = "#ffffff"
		mapColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newColor
		})

		expect(mapColorController["$scope"].color).toBe(newColor)
		expect(updateBrushColorSpy).toHaveBeenCalled()
	})

	it("should not update its scope's color onMapColorsChanged if color hasn't changed", () => {
		// this is important, as the input field is bound to $scope.color
		// and therefore "#fff" would jump immediately to "#ffffff" what is annoying for the user
		const mapColorController = createMapColorController()
		mapColorController.$onInit()

		const oldColor = "#fff"
		mapColorController["$scope"].color = oldColor
		const newSameColor = "#ffffff"
		mapColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newSameColor
		})

		expect(mapColorController["$scope"].color).toBe(oldColor)
	})

	it("should update the store, when its scope's color has changed to a new color", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		const dispatchSpy = jest.spyOn(mapColorController["storeService"], "dispatch")
		mapColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()

		expect(dispatchSpy).toHaveBeenCalled()
		expect(dispatchSpy.mock.calls[0][0]).toMatchObject({
			payload: { positive: "#ffffff" }
		})
	})

	it("should not update the store, when its scope's color has changed to the same color", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		mapColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()
		const dispatchSpy = jest.spyOn(mapColorController["storeService"], "dispatch")
		mapColorController["$scope"].color = "#fff"

		expect(dispatchSpy).not.toHaveBeenCalled()
	})

	it("should not update the store, when its scope's color has changed but is incomplete", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		const dispatchSpy = jest.spyOn(mapColorController["storeService"], "dispatch")
		mapColorController["$scope"].color = "#ff"
		$rootScope.$digest()

		expect(dispatchSpy).not.toHaveBeenCalled()
	})

	it("should update its brush' color, when its scope's color has changed", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		const updateBrushSpy = jest.spyOn<any, any>(mapColorController, "updateBrushColor")
		mapColorController["$scope"].color = "#ffffff"
		$rootScope.$digest()

		expect(updateBrushSpy).toHaveBeenCalled()
	})
})
