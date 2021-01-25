import angular from "angular"
import "angularjs-color-picker"
import "../../state/state.module"
import "../../codeCharta.module"

import customColorPickerTemplate from "./customColorPicker.template.html"
import { storeColorPickerComponent } from "./storeColorPicker/storeColorPicker.component"
import { nodeContextMenuColorPickerComponent } from "./nodeContextMenuColorPicker/nodeContextMenuColorPicker.component"

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
			options.pos = undefined // reset unwanted default positioning

			return options
		})
	})
	.component(storeColorPickerComponent.selector, storeColorPickerComponent)
	.component(nodeContextMenuColorPickerComponent.selector, nodeContextMenuColorPickerComponent)
	.run(function ($templateCache) {
		$templateCache.put("template/color-picker/directive.html", customColorPickerTemplate)
	})
