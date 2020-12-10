import { StoreService } from "../../state/store.service"
// import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

export class MapColorPickerController {
	private mapColorFor: string
	private open: string

	constructor(private storeService: StoreService, private $element: JQLite, private $scope) {}

	$onInit() {
		this.$scope.color = this.getCurrentColor()
		this.$scope.colorPickerOptions = { pos: this.open } // sets direction in which color-picker will open

		// this.storeService.dispatch(
		//   setMapColors({
		//     ...defaultMapColors,
		//     negative: "#f542ec"
		//   })
		// )
	}

	$postLink() {
		this.getColorPickerPanel().then(colorPickerPanel => {
			colorPickerPanel.appendChild(this.createColorInput())
		})
	}

	private getCurrentColor() {
		return this.storeService.getState().appSettings.mapColors[this.mapColorFor]
	}

	// todo onStateChange update color

	private async getColorPickerPanel() {
		return new Promise<ChildNode>(resolve => {
			const mutationObserver = new MutationObserver((mutations, observer) => {
				observer.disconnect()

				const colorPickerPanel = mutations[0].addedNodes[0].childNodes[1]
				resolve(colorPickerPanel)
			})

			const colorPicker = this.$element.find("color-picker")[0]
			mutationObserver.observe(colorPicker, { childList: true })
		})
	}

	private createColorInput() {
		const input = document.createElement("input")

		input.value = this.$scope.color
		this.$scope.$watch("color", () => {
			if (input.value !== this.$scope.color) {
				input.value = this.$scope.color
			}
		})

		input.addEventListener("input", () => {
			this.$scope.color = input.value
			this.$scope.$apply()
		})

		return input
	}
}

export const mapColorPickerComponent = {
	selector: "mapColorPicker",
	template: require("./mapColorPicker.component.html"),
	controller: MapColorPickerController,
	bindings: {
		label: "@",
		mapColorFor: "@",
		open: "@" // ['bottom left', 'bottom right', 'top left', 'top right'] - passed to angularjs-color-picker
	}
}
