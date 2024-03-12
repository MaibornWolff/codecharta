import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { State, Store } from "@ngrx/store"
import { map } from "rxjs"
import stringify from "safe-stable-stringify"
import { CcState, MapColors } from "../../../codeCharta.model"
import { setMapColors } from "../../store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../store/appSettings/mapColors/mapColors.reducer"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"

@Injectable()
export class UpdateMapColorsEffect {
	constructor(private store: Store<CcState>, private state: State<CcState>) {}

	updateMapColors$ = createEffect(() =>
		this.store.select(colorMetricSelector).pipe(
			map(colorMetric => {
				const state = this.state.getValue()
				const attributeDescriptors = state.fileSettings.attributeDescriptors
				if (attributeDescriptors[colorMetric]?.direction === 1) {
					const reversedMapColors: MapColors = JSON.parse(stringify(state.appSettings.mapColors))
					const temporary = reversedMapColors.negative
					reversedMapColors.negative = reversedMapColors.positive
					reversedMapColors.positive = temporary

					return setMapColors({ value: reversedMapColors })
				}
				return setMapColors({ value: defaultMapColors })
			})
		)
	)
}
