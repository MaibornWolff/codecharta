import "./nodeContextMenuColorPicker.component.scss"

import { hasValidHexLength } from "../colorHelper"

export class NodeContextMenuColorPickerController {
	private markFolder: ({ color: string }) => void

	constructor(private $scope) {}

	$onInit() {
		this.$scope.color = "#FF0000" // without initial value the color-picker's popup would show a 100% transparent color initially
		this.$scope.nodeContextMenuColorPickerEventApi = {
			onChange: (_, newColor) => {
				if (hasValidHexLength(newColor)) this.markFolder({ color: newColor })
			}
		}
	}
}

export const nodeContextMenuColorPickerComponent = {
	selector: "ccNodeContextMenuColorPicker",
	template: require("./nodeContextMenuColorPicker.component.html"),
	controller: NodeContextMenuColorPickerController,
	bindings: {
		markFolder: "&"
	}
}
