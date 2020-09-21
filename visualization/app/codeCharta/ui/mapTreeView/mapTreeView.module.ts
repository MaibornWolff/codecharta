import angular from "angular"
import "../../state/state.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"

import "./mapTreeView.component.scss"

import { mapTreeViewComponent } from "./mapTreeView.component"
import { mapTreeViewLevelComponent } from "./mapTreeView.level.component"

angular
	.module("app.codeCharta.ui.mapTreeView", ["app.codeCharta.state", "app.codeCharta.ui.codeMap", "app.codeCharta"])
	.component(mapTreeViewComponent.selector, mapTreeViewComponent)
	.component(mapTreeViewLevelComponent.selector, mapTreeViewLevelComponent)
	.directive("ngRightClick", $parse => {
		return (scope, element, attributes) => {
			const fn = $parse(attributes.ngRightClick)
			element.bind("contextmenu", event => {
				scope.$apply(() => {
					event.preventDefault()
					fn(scope, { $event: event })
				})
			})
		}
	})
