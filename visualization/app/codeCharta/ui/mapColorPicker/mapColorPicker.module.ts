import angular from "angular"
import "angularjs-color-picker"
import "angularjs-color-picker/dist/angularjs-color-picker.min.css"
import "angularjs-color-picker/dist/themes/angularjs-color-picker-bootstrap.min.css"

import { mapColorPickerComponent } from "./mapColorPicker.component"

angular
	.module("app.codeCharta.ui.mapColorPicker", [
		"color.picker" // https://github.com/ruhley/angular-color-picker
	])
	.config(function ($provide) {
		$provide.decorator("ColorPickerOptions", function ($delegate) {
			const options = angular.copy($delegate)

			options.alpha = false
			options.format = "hexString"
			options.swatchOnly = true
			options.restrictToFormat = true

			return options
		})
	})
	.component(mapColorPickerComponent.selector, mapColorPickerComponent)
