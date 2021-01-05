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
		storeService = getService<StoreService>("storeService")
		$controller = getService<IControllerService>("$controller")

		createMapColorController = (mapColorFor: keyof MapColors = "positive") => {
			const controller = $controller(
				MapColorPickerController,
				{
					$rootScope,
					$element: $compile('<cc-map-color-picker map-color-for="positive" label="my label"></cc-map-color-picker>')($rootScope),
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

	it("should set the initial color if used for 'negative", () => {
		const mapColorController = createMapColorController("negative")
		mapColorController.$onInit()
		expect(mapColorController["$scope"].color).toBe(defaultMapColors["negative"])
	})

	it("should set the initial color if used for 'positive", () => {
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

	it("should add margin element and color-input field `onOpen` once", () => {
		const inputFieldSelector = "color-picker .cc-color-picker-input"
		const marginSelector = ".cc-color-picker-grid-margin"
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		// verify there is no color-input field and margin element initially
		expect(mapColorController["$element"][0].querySelector(inputFieldSelector)).toBe(null)
		expect(mapColorController["$element"][0].querySelector(marginSelector)).toBe(null)

		// verify they are added once `onOpen`
		mapColorController["$scope"].colorPickerEventApi.onOpen()
		expect(mapColorController["$element"][0].querySelectorAll(inputFieldSelector).length).toBe(1)
		expect(mapColorController["$element"][0].querySelectorAll(marginSelector).length).toBe(1)

		// verify they exist only once after another call to `onOpen`
		mapColorController["$scope"].colorPickerEventApi.onOpen()
		expect(mapColorController["$element"][0].querySelectorAll(inputFieldSelector).length).toBe(1)
		expect(mapColorController["$element"][0].querySelectorAll(marginSelector).length).toBe(1)
	})

	it("should focus its wrapper on `onOpen`", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()
		const wrapperToBeFocused = mapColorController["$element"][0].querySelector(".cc-map-color-picker-wrapper") as HTMLElement
		wrapperToBeFocused.focus = jest.fn()
		mapColorController["$scope"].colorPickerEventApi.onOpen()

		expect(wrapperToBeFocused.focus).toHaveBeenCalled()
	})

	it("should add brush-icon `onOpen` and remove it again `onClose`", () => {
		const mapColorController = createMapColorController()
		$rootScope.$digest()
		mapColorController.$onInit()

		const swatch = mapColorController["$element"][0].querySelector(".color-picker-swatch")

		expect(swatch.classList.contains("fa-paint-brush")).toBe(false)

		mapColorController["$scope"].colorPickerEventApi.onOpen()
		expect(swatch.classList.contains("fa-paint-brush")).toBe(true)

		mapColorController["$scope"].colorPickerEventApi.onClose()
		expect(swatch.classList.contains("fa-paint-brush")).toBe(false)
	})

	it("should update its scope color onMapColorsChanged", () => {
		const mapColorController = createMapColorController()
		mapColorController.$onInit()

		const newColor = "#ffffff"
		mapColorController.onMapColorsChanged({
			...defaultMapColors,
			positive: newColor
		})

		expect(mapColorController["$scope"].color).toBe(newColor)
	})

	it("should update store only if the color has changed", () => {
		const mapColorController = createMapColorController()
		mapColorController["storeService"].dispatch = jest.fn()
		$rootScope.$digest()
		mapColorController.$onInit()

		mapColorController["$scope"].colorPickerEventApi.onChange(null, mapColorController["$scope"].color)
		expect(mapColorController["storeService"].dispatch).not.toHaveBeenCalled()

		mapColorController["$scope"].colorPickerEventApi.onChange(null, "#fffff")
		expect(mapColorController["storeService"].dispatch).toHaveBeenCalledTimes(1)
	})

	it("should update value of custom color input field, when its $scope.color changes", () => {
		const mapColorController = createMapColorController()
		mapColorController["storeService"].dispatch = jest.fn()
		$rootScope.$digest()
		mapColorController.$onInit()
		mapColorController["$scope"].colorPickerEventApi.onOpen()
		const colorInputField = mapColorController["$element"][0].querySelector(".cc-color-picker-input") as HTMLInputElement
		const initialValue = colorInputField.value

		const newValue = `${initialValue}1`
		mapColorController["$scope"].color = newValue
		mapColorController["$scope"].$digest()

		expect(colorInputField.value).toBe(newValue)
	})
})
