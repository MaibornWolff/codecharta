import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import stringify from "safe-stable-stringify"
import { CcState, MapColors } from "../../../../model/codeCharta.model"
import { colorMetricSelector, defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { setMapColors } from "../../../../stores/mapState/mapState.write.facade"
import { MetricsLensSourceReadWindow } from "../../../../stores/metricsLensSource/metricsLensSource.read.facade"

@Injectable()
export class UpdateMapColorsEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsLensSourceReadWindow: MetricsLensSourceReadWindow
    ) {}

    updateMapColors$ = createEffect(() =>
        this.store.select(colorMetricSelector).pipe(
            map(colorMetric => {
                const attributeDescriptors = this.metricsLensSourceReadWindow.getAttributeDescriptors()
                const mapColors = this.mapStateReadWindow.getMapColors()
                if (attributeDescriptors[colorMetric]?.direction === 1) {
                    const reversedMapColors: MapColors = JSON.parse(stringify(mapColors))
                    const temporary = reversedMapColors.negative
                    reversedMapColors.negative = reversedMapColors.positive
                    reversedMapColors.positive = temporary

                    return setMapColors({ value: reversedMapColors })
                }
                return setMapColors({ value: mapColors ?? defaultMapColors })
            })
        )
    )
}
