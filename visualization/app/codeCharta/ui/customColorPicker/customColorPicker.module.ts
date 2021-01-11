import angular from "angular"
import "angularjs-color-picker"
import "../../state/state.module"
import "../../codeCharta.module"

import { storeColorPickerComponent } from "./storeColorPicker/storeColorPicker.component"
import customColorPickerTemplate from "./customColorPicker.template.html"

import "./customColorPicker.scss"

angular
	.module("app.codeCharta.ui.customColorPicker", [
		"color.picker", // https://github.com/ruhley/angular-color-picker
		"app.codeCharta.state",
		"app.codeCharta"
	])
	.config(function ($provide) {
		$provide.decorator("ColorPickerOptions", function ($delegate) {
			const options = angular.copy($delegate)

			options.alpha = false
			options.format = "hexString"
			options.restrictToFormat = true

			return options
		})
	})
	.component(storeColorPickerComponent.selector, storeColorPickerComponent)
	.run(function ($templateCache) {
		$templateCache.put("template/color-picker/directive.html", customColorPickerTemplate)
	})
