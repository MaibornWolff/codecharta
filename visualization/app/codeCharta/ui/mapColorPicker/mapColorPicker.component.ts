import { StoreService } from "../../state/store.service"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

export class MapColorPickerController {
	constructor(private storeService: StoreService) {
		setTimeout(() => {
			this.storeService.dispatch(
				setMapColors({
					...defaultMapColors,
					negative: "#f542ec"
				})
			)
		}, 3000)
	}
}

export const mapColorPickerComponent = {
	selector: "mapColorPicker",
	template: require("./mapColorPicker.component.html"),
	controller: MapColorPickerController
}
