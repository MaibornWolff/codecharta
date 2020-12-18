import "./mapColorPicker.component.scss"
import { StoreService } from "../../state/store.service"
import { IRootScopeService } from "angular"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../codeCharta.model"
import { MapColorsSubscriber, MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"

export class MapColorPickerController implements MapColorsSubscriber {
	private mapColorFor: keyof MapColors

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private $element: JQLite, private $scope) {
		MapColorsService.subscribe(this.$rootScope, this)
	}

	onMapColorsChanged(mapColors: MapColors) {
		this.$scope.color = mapColors[this.mapColorFor]
	}

	$onInit() {
		this.$scope.color = this.getColorFromStore()
		this.$scope.colorPickerOptions = { pos: undefined } // reset unwanted default positioning
		this.$scope.colorPickerEventApi = {
			onOpen: () => {
				;(this.$element[0].querySelector(".cc-map-color-picker-wrapper") as HTMLElement).focus()
				this.$element[0].querySelector(".color-picker-swatch").classList.add("fa", "fa-paint-brush")
				if (!this.hasColorInputField()) {
					// check this each time `onOpen`, instead of using a MutationObserver in `$postLink`,
					// as e.g. angularjs' `ng-if` re-creates the innerNode (e.g. in the legend component)
					const colorPicker = this.$element[0].querySelector("color-picker")
					colorPicker.querySelector(".color-picker-panel").appendChild(this.createColorInput())
					colorPicker
						.querySelector(".color-picker-grid")
						.insertAdjacentHTML("afterend", this.createDivForColorPickerMargin().outerHTML)
				}
			},
			onClose: () => {
				this.$element[0].querySelector(".color-picker-swatch").classList.remove("fa", "fa-paint-brush")
			},
			onChange: (_, color) => {
				this.updateMapColor(color)
			}
		}
	}

	private updateMapColor(color: string) {
		if (color !== this.getColorFromStore()) {
			this.storeService.dispatch(
				setMapColors({
					...this.storeService.getState().appSettings.mapColors,
					[this.mapColorFor]: color
				})
			)
		}
	}

	private getColorFromStore() {
		return this.storeService.getState().appSettings.mapColors[this.mapColorFor]
	}

	private hasColorInputField() {
		return this.$element[0].querySelector("color-picker .cc-color-picker-input") !== null
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
			this.updateMapColor(input.value)
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
		mapColorFor: "@"
	}
}
