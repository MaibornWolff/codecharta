import "./mapColorPicker.module"

import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import angular, { IScope, IControllerService } from "angular"
import { StoreService } from "../../state/store.service"
import { MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"
import { MapColorPickerController, mapColorPickerComponent } from "./mapColorPicker.component"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../codeCharta.model"

describe("MapColorPickerController", () => {
	let $rootScope: IScope
	let storeService: StoreService
	let $scope: IScope
	let $controller: IControllerService
	let createMapColorController: () => MapColorPickerController

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.mapColorPicker")

		$rootScope = getService<IScope>("$rootScope")
		$scope = $rootScope.$new()
		storeService = getService<StoreService>("storeService")
		$controller = getService<IControllerService>("$controller")

		createMapColorController = (mapColorFor: keyof MapColors = "positive") => {
			const controller = $controller(
				MapColorPickerController,
				{
					$rootScope,
					$element: angular.element('<cc-map-color-picker map-color-for="positive" label="my label"></cc-map-color-picker>'),
					$scope,
					storeService
				},
				{
					mapColorFor
				}
			)
			return controller
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

	it("should set the initial color", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()
		expect(mapColorController["$scope"].color).toBe(defaultMapColors.positive)
	})

	it("should update the color onMapColorsChanged", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()

		const newColor = "#ffffff"
		mapColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newColor
		})

		expect(mapColorController["$scope"].color).toBe(newColor)
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

	it.skip("toto: should add margin elem and color-input field once", () => {})
})
