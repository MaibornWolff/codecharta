import "./nodeContextMenuColorPicker.component.scss"

export class NodeContextMenuColorPickerController {
  constructor(private $scope) {}

  $onInit() {
    this.$scope.color = "#924D4D"
    this.$scope.nodeContextMenuColorPickerEventApi = {
			onChange: (_, newColor) => {
        console.log(newColor)
        // todo scope.mark
			}
		}
  }
}

export const nodeContextMenuColorPickerComponent = {
	selector: "ccNodeContextMenuColorPicker",
	template: require("./nodeContextMenuColorPicker.component.html"),
	controller: NodeContextMenuColorPickerController,
}
