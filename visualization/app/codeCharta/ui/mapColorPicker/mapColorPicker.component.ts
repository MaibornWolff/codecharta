import "./mapColorPicker.component.scss"
import { StoreService } from "../../state/store.service"
import { IRootScopeService } from "angular"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { MapColors } from "../../codeCharta.model"
import { MapColorsSubscriber, MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"
import { isSameHexColor, hasValidHexLength, normalizeHex, getReadableColorForBackground } from "./colorHelper"

export class MapColorPickerController implements MapColorsSubscriber {
	private mapColorFor: keyof MapColors

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private $element: JQLite, private $scope) {
		MapColorsService.subscribe(this.$rootScope, this)
	}

	onMapColorsChanged(mapColors: MapColors) {
		const colorFromStore = mapColors[this.mapColorFor] as string // todo improve type / exclude non strings
		if (!isSameHexColor(this.$scope.color, colorFromStore)) this.$scope.color = mapColors[this.mapColorFor]
	}

	$onInit() {
		this.$scope.color = this.getColorFromStore()
		this.$scope.$watch("color", () => {
			if (hasValidHexLength(this.$scope.color)) {
				const normalizedHex = normalizeHex(this.$scope.color)
				this.updateMapColorInStore(normalizedHex)
				this.updateBrushColor(normalizedHex)
			}
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

export const mapColorPickerComponent = {
	selector: "ccMapColorPicker",
	template: require("./mapColorPicker.component.html"),
	controller: MapColorPickerController,
	bindings: {
		label: "@",
		mapColorFor: "@"
	}
}
