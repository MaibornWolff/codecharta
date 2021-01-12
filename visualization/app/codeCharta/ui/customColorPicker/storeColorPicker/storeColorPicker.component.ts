import "./storeColorPicker.component.scss"
import { StoreService } from "../../../state/store.service"
import { IRootScopeService } from "angular"
import { setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../../codeCharta.model"
import { MapColorsSubscriber, MapColorsService } from "../../../state/store/appSettings/mapColors/mapColors.service"
import { isSameHexColor, hasValidHexLength, normalizeHex, getReadableColorForBackground } from "../colorHelper"

export class StoreColorPickerController implements MapColorsSubscriber {
	private mapColorFor: Exclude<keyof MapColors, "markingColors" | "labelColorAndAlpha">

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private $element: JQLite, private $scope) {
		MapColorsService.subscribe(this.$rootScope, this)
	}

	onMapColorsChanged(mapColors: MapColors) {
		if (!isSameHexColor(this.$scope.color, mapColors[this.mapColorFor])) {
			this.$scope.color = mapColors[this.mapColorFor]
			this.updateBrushColor(mapColors[this.mapColorFor])
		}
	}

	$onInit() {
		this.$scope.color = this.getColorFromStore()
		this.$scope.$watch("color", newColor => {
			if (!hasValidHexLength(newColor) || isSameHexColor(newColor, this.getColorFromStore())) return

			const normalizedHex = normalizeHex(newColor)
			this.updateMapColorInStore(normalizedHex)
			this.updateBrushColor(normalizedHex)
		})

		this.$scope.colorPickerOptions = { pos: undefined } // reset unwanted default positioning
		this.$scope.colorPickerEventApi = {
			onChange: (_, newColor) => {
				// The color picker area works fine without manual assigning of scope, but the input field doesn't.
				// Related: https://github.com/ruhley/angular-color-picker/issues/184 and 188
				this.$scope.color = newColor
			}
		}
	}

	private updateBrushColor(normalizedHex: string) {
		const brushIcon = this.$element[0].querySelector(".cc-color-picker-swatch-brush-icon") as HTMLElement
		if (brushIcon !== null) brushIcon.style.color = getReadableColorForBackground(normalizedHex)
	}

	private updateMapColorInStore(color: string) {
		this.storeService.dispatch(
			setMapColors({
				...this.storeService.getState().appSettings.mapColors,
				[this.mapColorFor]: color
			})
		)
	}

	private getColorFromStore() {
		return this.storeService.getState().appSettings.mapColors[this.mapColorFor]
	}
}

export const storeColorPickerComponent = {
	selector: "ccStoreColorPicker",
	template: require("./storeColorPicker.component.html"),
	controller: StoreColorPickerController,
	bindings: {
		label: "@",
		mapColorFor: "@"
	}
}
