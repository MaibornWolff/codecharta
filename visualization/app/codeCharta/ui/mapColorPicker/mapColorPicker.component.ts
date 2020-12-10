import "./mapColorPicker.component.scss"
import { StoreService } from "../../state/store.service"
// import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

export class MapColorPickerController {
	private mapColorFor: string
	private open: string

	constructor(private storeService: StoreService, private $element: JQLite, private $scope) {}

	$onInit() {
		this.$scope.color = this.getCurrentColor()
		this.$scope.colorPickerOptions = { pos: this.open } // sets direction in which color-picker will open
		this.$scope.colorPickerEventApi = {
			onOpen: () => {
				this.$element[0].querySelector(".color-picker-swatch").classList.add("fa", "fa-paint-brush")
			},
			onClose: () => {
				this.$element[0].querySelector(".color-picker-swatch").classList.remove("fa", "fa-paint-brush")
			}
		}

		// this.storeService.dispatch(
		//   setMapColors({
		//     ...defaultMapColors,
		//     negative: "#f542ec"
		//   })
		// )
	}

	$postLink() {
		this.waitForColorPickersDom().then(colorPicker => {
			colorPicker.querySelector(".color-picker-panel").appendChild(this.createColorInput())
			colorPicker.querySelector(".color-picker-grid").insertAdjacentHTML("afterend", this.createDivForColorPickerMargin().outerHTML)
		})
	}

	private getCurrentColor() {
		return this.storeService.getState().appSettings.mapColors[this.mapColorFor]
	}

	// todo onStateChange update color

	private async waitForColorPickersDom() {
		return new Promise<HTMLElement>(resolve => {
			const mutationObserver = new MutationObserver((_, observer) => {
				// color-picker element is sole mutator and adds everything in one flow within its $compile
				observer.disconnect()
				resolve(colorPicker)
			})

			const colorPicker = this.$element.find("color-picker")[0]
			mutationObserver.observe(colorPicker, { childList: true })
		})
	}

	private createColorInput() {
		const input = document.createElement("input")

		input.classList.add("cc-color-picker-input")

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

	private createDivForColorPickerMargin() {
		const div = document.createElement("div")
		div.classList.add("cc-color-picker-grid-margin")
		return div
	}
}

export const mapColorPickerComponent = {
	selector: "ccMapColorPicker",
	template: require("./mapColorPicker.component.html"),
	controller: MapColorPickerController,
	bindings: {
		label: "@",
		mapColorFor: "@",
		open: "@" // ['bottom left', 'bottom right', 'top left', 'top right'] - passed to angularjs-color-picker
	}
}
