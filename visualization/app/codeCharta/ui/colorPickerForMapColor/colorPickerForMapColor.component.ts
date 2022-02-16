import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"

import { ColorRange, MapColors } from "../../codeCharta.model"
import { Store } from "../../state/angular-redux/store"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"

@Component({
	selector: "cc-color-picker-for-map-color",
	template: require("./colorPickerForMapColor.component.html")
})
export class ColorPickerForMapColorComponent {
	@Input() mapColorFor: keyof MapColors

	mapColors$: Observable<MapColors>
	colorRange$: Observable<ColorRange>

	constructor(@Inject(Store) private store: Store) {
		this.mapColors$ = this.store.select(mapColorsSelector)
		this.colorRange$ = this.store.select(colorRangeSelector)
	}

	handleColorChange(newHexColor: string) {
		this.store.dispatch(
			setMapColors({
				[this.mapColorFor]: newHexColor
			})
		)
	}
}
