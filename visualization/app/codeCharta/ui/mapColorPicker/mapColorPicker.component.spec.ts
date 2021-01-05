import "./mapColorPicker.module"

import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import angular, { IScope, IControllerService } from "angular"
import { StoreService } from "../../state/store.service"
import { MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"
import { MapColorPickerController } from "./mapColorPicker.component"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

describe("MapColorPickerController", () => {
	let $rootScope: IScope
	let storeService: StoreService
	let $scope: IScope
	let $controller: IControllerService
	let createMapColorController: () => MapColorPickerController

	beforeEach(() => {
		instantiateModule("app.codeCharta.ui.mapColorPicker")

		// $compile = getService<ICompileService>("$compile")
		$rootScope = getService<IScope>("$rootScope")
		$scope = $rootScope.$new()
		storeService = getService<StoreService>("storeService")
		$controller = getService<IControllerService>("$controller")

		createMapColorController = (mapColorFor = "positive") => {
			const controller = $controller(MapColorPickerController, {
				$rootScope,
				$element: angular.element('<cc-map-color-picker map-color-for="positive" label="my label"></cc-map-color-picker>'),
				$scope,
				storeService
			})
			controller["mapColorFor"] = mapColorFor
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
		mapColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: "#ffffff"
		})
		expect(mapColorController["$scope"].color).toBe("#ffffff")
	})

	it("should set colorPickerOptions to overwrite angularjs-color-picker's default value", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()
		expect(mapColorController["$scope"].colorPickerOptions).toEqual({ pos: undefined })
	})

	it.skip("toto: should test map-color-for attribute", () => {
		// const mapColorController = createMapColorController();
		// mapColorController.$onInit()
		// mapColorController["$scope"].colorPickerEventApi.onOpen();
		// const component = $compile('<cc-map-color-picker map-color-for="positive" label="my label"></cc-map-color-picker>')($rootScope)
		// $rootScope.$digest()
		// console.log(component.html())
		// console.log(component.controller.mapColorFor)
		// component.attr("map-color-for")
	})

	it.skip("toto: should add margin elem and color-input field once", () => {})
})
