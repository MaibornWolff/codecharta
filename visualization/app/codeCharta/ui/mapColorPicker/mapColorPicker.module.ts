import angular from "angular"
import "angularjs-color-picker"
import "../../state/state.module"
import "../../codeCharta.module"

import { mapColorPickerComponent } from "./mapColorPicker.component"
import customColorPickerTemplate from "./colorPicker.template.html"

angular
	.module("app.codeCharta.ui.mapColorPicker", [
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
	.component(mapColorPickerComponent.selector, mapColorPickerComponent)
	.run(function ($templateCache) {
		$templateCache.put("template/color-picker/directive.html", customColorPickerTemplate)
	})
